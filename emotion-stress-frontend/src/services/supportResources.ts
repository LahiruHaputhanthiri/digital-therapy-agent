import { SupportResource } from '@/types';

export const SUPPORT_RESOURCES: SupportResource[] = [
  {
    id: 'us-988',
    country: 'United States',
    countryCode: 'US',
    name: 'National Suicide & Crisis Lifeline',
    phone: '988',
    sms: 'Text HOME to 741741',
    website: 'https://988lifeline.org',
    type: 'crisis',
    description: 'Free, confidential 24/7 support for individuals in distress or suicidal crisis.',
    available: '24/7/365',
  },
  {
    id: 'us-trevor',
    country: 'United States',
    countryCode: 'US',
    name: 'The Trevor Project (LGBTQ+ Youth)',
    phone: '1-866-488-7386',
    sms: 'Text START to 678-678',
    website: 'https://www.thetrevorproject.org',
    type: 'youth',
    description: 'Confidential crisis intervention and suicide prevention for LGBTQ young people.',
    available: '24/7',
  },
  {
    id: 'uk-samaritans',
    country: 'United Kingdom',
    countryCode: 'GB',
    name: 'Samaritans Helpline',
    phone: '116 123',
    sms: 'Text SHOUT to 85258',
    website: 'https://www.samaritans.org',
    type: 'crisis',
    description: 'Free 24/7 confidential listening support for anyone struggling to cope.',
    available: '24/7',
  },
  {
    id: 'ca-talksuicide',
    country: 'Canada',
    countryCode: 'CA',
    name: 'Talk Suicide Canada',
    phone: '1-833-456-4566',
    sms: 'Text 45645',
    website: 'https://talksuicide.ca',
    type: 'crisis',
    description: 'National bilingual service providing nationwide suicide prevention and crisis support.',
    available: '24/7',
  },
  {
    id: 'au-lifeline',
    country: 'Australia',
    countryCode: 'AU',
    name: 'Lifeline Australia',
    phone: '13 11 14',
    sms: 'Text 0477 13 11 14',
    website: 'https://www.lifeline.org.au',
    type: 'crisis',
    description: 'National charity providing all Australians experiencing emotional distress access to 24-hour support.',
    available: '24/7',
  },
  {
    id: 'lk-nimh',
    country: 'Sri Lanka',
    countryCode: 'LK',
    name: 'National Mental Health Helpline (NIMH)',
    phone: '1926',
    website: 'http://nimh.health.gov.lk',
    type: 'mental_health',
    description: 'National Institute of Mental Health 24-hour toll-free mental health support helpline.',
    available: '24/7 Toll-free',
  },
  {
    id: 'lk-sumithrayo',
    country: 'Sri Lanka',
    countryCode: 'LK',
    name: 'Sumithrayo Emotional Support',
    phone: '+94 11 269 2909',
    website: 'https://srilankasumithrayo.lk',
    type: 'crisis',
    description: 'Confidential emotional support and befriending service for people in despair.',
    available: '9:00 AM - 8:00 PM Daily',
  },
  {
    id: 'global-findahelpline',
    country: 'International / Global',
    countryCode: 'GLOBAL',
    name: 'Find A Helpline / Befrienders Worldwide',
    phone: 'Free online directory',
    website: 'https://findahelpline.com',
    type: 'general',
    description: 'Global database of verified, confidential crisis lines and mental health support services worldwide.',
    available: '24/7 Web Directory',
  },
];

export const SupportResourceService = {
  getAll(): SupportResource[] {
    return SUPPORT_RESOURCES;
  },

  getByCountry(countryCode: string): SupportResource[] {
    const uppercase = (countryCode || '').toUpperCase();
    const matches = SUPPORT_RESOURCES.filter(
      (r) => r.countryCode === uppercase || r.countryCode === 'GLOBAL'
    );
    return matches.length > 0 ? matches : SUPPORT_RESOURCES;
  },

  getSupportedCountries(): { code: string; label: string }[] {
    return [
      { code: 'ALL', label: 'All Regions' },
      { code: 'US', label: 'United States' },
      { code: 'GB', label: 'United Kingdom' },
      { code: 'CA', label: 'Canada' },
      { code: 'AU', label: 'Australia' },
      { code: 'LK', label: 'Sri Lanka' },
      { code: 'GLOBAL', label: 'International' },
    ];
  },
};
