"""Comprehensive Test Suite for MindCare 3-Tier RBAC (User, Admin, Super Admin) & Database Models."""

import os
import sys

# Ensure backend directory is in python search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from database import Base, SessionLocal, engine
import models
from main import app

client = TestClient(app)


def test_suite() -> None:
    print("==================================================")
    print("Starting MindCare 3-Tier RBAC & DB Test Suite")
    print("==================================================")

    # 1. Initialize Tables
    Base.metadata.create_all(bind=engine)
    print(" [1] Database tables initialized.")

    db = SessionLocal()
    try:
        # Clean up existing test data
        db.query(models.ChatLog).delete()
        db.query(models.User).delete()
        db.commit()
    finally:
        db.close()

    # 2. Register standard user
    res = client.post(
        "/api/v1/auth/register",
        json={"username": "AliceUser", "email": "alice@example.com", "password": "UserPass123!", "role": "user"},
    )
    assert res.status_code == 201, f"User registration failed: {res.text}"
    user_data = res.json()
    assert user_data["role"] == "user"
    print(f" [2] Standard user registered: ID={user_data['id']} (role={user_data['role']})")

    # 3. Bootstrap Initial Super Admin
    res = client.post(
        "/api/v1/auth/register",
        json={
            "username": "RootSuperAdmin",
            "email": "root@example.com",
            "password": "SuperAdminPass123!",
            "role": "super_admin",
            "admin_secret": "super-admin-ultra-secret-2026",
        },
    )
    assert res.status_code == 201, f"Super Admin bootstrap failed: {res.text}"
    super_admin_data = res.json()
    assert super_admin_data["role"] == "super_admin"
    print(f" [3] Super Admin bootstrapped: ID={super_admin_data['id']} (role={super_admin_data['role']})")

    # 4. Bootstrap Admin using Admin Secret
    res = client.post(
        "/api/v1/auth/register",
        json={
            "username": "BobAdmin",
            "email": "bob@example.com",
            "password": "AdminPass123!",
            "role": "admin",
            "admin_secret": "admin-super-secret-key-2026",
        },
    )
    assert res.status_code == 201, f"Admin registration failed: {res.text}"
    admin_data = res.json()
    assert admin_data["role"] == "admin"
    print(f" [4] Admin registered: ID={admin_data['id']} (role={admin_data['role']})")

    # 5. Attempt unauthorized super_admin registration (Fraudulent escalation)
    res = client.post(
        "/api/v1/auth/register",
        json={
            "username": "FraudSuper",
            "email": "fraud@example.com",
            "password": "Pass123!",
            "role": "super_admin",
            "admin_secret": "wrong-secret",
        },
    )
    assert res.status_code == 403, f"Expected 403 Forbidden, got {res.status_code}: {res.text}"
    print(" [5] Unauthorized super_admin escalation blocked (HTTP 403).")

    # 6. Logins & JWT retrieval
    user_login = client.post("/api/v1/auth/login", json={"email": "alice@example.com", "password": "UserPass123!"})
    assert user_login.status_code == 200
    user_token = user_login.json()["access_token"]

    admin_login = client.post("/api/v1/auth/login", json={"email": "bob@example.com", "password": "AdminPass123!"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    super_login = client.post("/api/v1/auth/login", json={"email": "root@example.com", "password": "SuperAdminPass123!"})
    assert super_login.status_code == 200
    super_token = super_login.json()["access_token"]
    print(" [6] JWT tokens generated for User, Admin, and Super Admin.")

    # 7. GET /api/v1/auth/me (All roles can access)
    for token, expected_role in [(user_token, "user"), (admin_token, "admin"), (super_token, "super_admin")]:
        me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["role"] == expected_role
    print(" [7] /api/v1/auth/me resolved correct identity for all 3 tiers.")

    # 8. RBAC Test on Admin Route: GET /api/v1/auth/admin/users
    # User -> 403 Forbidden
    res = client.get("/api/v1/auth/admin/users", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 403
    # Admin -> 200 OK
    res = client.get("/api/v1/auth/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    # Super Admin -> 200 OK
    res = client.get("/api/v1/auth/admin/users", headers={"Authorization": f"Bearer {super_token}"})
    assert res.status_code == 200
    print(" [8] RBAC Guard verified on /api/v1/auth/admin/users (User=403, Admin=200, SuperAdmin=200).")

    # 9. RBAC Test on Super Admin Route: POST /api/v1/admin/create-admin
    new_admin_payload = {
        "username": "CharlieAdmin",
        "email": "charlie@example.com",
        "password": "CharliePass123!",
        "role": "admin",
    }
    # User -> 403 Forbidden
    res = client.post("/api/v1/admin/create-admin", json=new_admin_payload, headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 403
    # Admin -> 403 Forbidden (Only Super Admin can provision admins)
    res = client.post("/api/v1/admin/create-admin", json=new_admin_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 403
    # Super Admin -> 201 Created
    res = client.post("/api/v1/admin/create-admin", json=new_admin_payload, headers={"Authorization": f"Bearer {super_token}"})
    assert res.status_code == 201, f"Create admin failed: {res.text}"
    assert res.json()["email"] == "charlie@example.com"
    print(" [9] RBAC Guard verified on POST /api/v1/admin/create-admin (User=403, Admin=403, SuperAdmin=201).")

    # 10. RBAC Test on Super Admin Route: GET /api/v1/super-admin/system-stats
    # User -> 403 Forbidden
    res = client.get("/api/v1/super-admin/system-stats", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 403
    # Admin -> 403 Forbidden
    res = client.get("/api/v1/super-admin/system-stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 403
    # Super Admin -> 200 OK
    res = client.get("/api/v1/super-admin/system-stats", headers={"Authorization": f"Bearer {super_token}"})
    assert res.status_code == 200, f"System stats failed: {res.text}"
    stats = res.json()
    assert stats["total_users"] == 4
    assert stats["users_by_role"]["user"] == 1
    assert stats["users_by_role"]["admin"] == 2
    assert stats["users_by_role"]["super_admin"] == 1
    assert "models_status" in stats
    print(f" [10] RBAC Guard verified on GET /api/v1/super-admin/system-stats (Total users={stats['total_users']}, stats={stats['users_by_role']}).")

    # 11. ChatLog direct ORM test
    db = SessionLocal()
    try:
        user_obj = db.query(models.User).filter(models.User.email == "alice@example.com").first()
        log = models.ChatLog(
            user_id=user_obj.id,
            user_message="I'm feeling very overwhelmed with exams.",
            ai_response="I hear you. Let's take things one step at a time.",
            detected_emotion="fear",
            stress_score=0.88,
        )
        db.add(log)
        db.commit()

        queried_user = db.query(models.User).filter(models.User.id == user_obj.id).first()
        assert len(queried_user.chat_logs) >= 1
        print(" [11] ChatLog telemetry turn logged and verified for user via ORM.")
    finally:
        db.close()

    # 12. REST API Test: POST /api/v1/chat/save
    chat_turn_payload = {
        "user_message": "Can you guide me through a 4-4-4 breathing exercise?",
        "ai_response": "Of course. Breathe in slowly for 4 seconds, hold for 4, and exhale for 4.",
        "detected_emotion": "sadness",
        "stress_score": 0.65,
    }
    # Unauthenticated -> 401 Unauthorized
    res = client.post("/api/v1/chat/save", json=chat_turn_payload)
    assert res.status_code == 401

    # Authenticated user -> 201 Created
    res = client.post("/api/v1/chat/save", json=chat_turn_payload, headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 201, f"Failed to save chat turn: {res.text}"
    saved_turn = res.json()
    assert saved_turn["user_message"] == chat_turn_payload["user_message"]
    assert saved_turn["detected_emotion"] == "sadness"
    assert saved_turn["stress_score"] == 0.65
    print(f" [12] POST /api/v1/chat/save persisted turn #{saved_turn['id']} under user '{user_obj.username}'.")

    # 13. REST API Test: GET /api/v1/chat/history
    # Unauthenticated -> 401 Unauthorized
    res = client.get("/api/v1/chat/history")
    assert res.status_code == 401

    # Authenticated User -> Returns user's logs
    res = client.get("/api/v1/chat/history", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 200
    user_history = res.json()
    assert len(user_history) >= 2
    assert any(turn["user_message"] == chat_turn_payload["user_message"] for turn in user_history)

    # Authenticated Admin -> Empty or isolated logs (user isolation)
    res = client.get("/api/v1/chat/history", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    admin_history = res.json()
    assert len(admin_history) == 0
    print(f" [13] GET /api/v1/chat/history verified user isolation (User turns: {len(user_history)}, Admin turns: {len(admin_history)}).")

    print("\nALL 13 RBAC, CHAT-PERSISTENCE, & DATABASE TESTS PASSED WITH 100% SUCCESS!")
    print("==================================================")


if __name__ == "__main__":
    test_suite()
