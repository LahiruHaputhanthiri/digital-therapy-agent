const pptxgen = require('pptxgenjs');
const path = require('path');

const html2pptx = require('C:/Users/lahir/.gemini/config/skills/presentation-skills/scripts/html2pptx.js');

const SLIDES_DIR = path.join(__dirname, 'slides');

const slideFiles = [
  'slide01_title.html',
  'slide02_intro_problem.html',
  'slide03_literature_gap.html',
  'slide04_aim_objectives.html',
  'slide05_architecture.html',
  'slide06_sequence_workflow.html',
  'slide07_ml_results.html',
  'slide08_multimodal_fusion.html',
  'slide09_therapy_privacy.html',
  'slide10_testing_validation.html',
  'slide11_live_demo.html',
  'slide12_limitations.html',
  'slide13_future_work.html',
  'slide14_conclusion.html',
  'slide15_thankyou.html',
];

async function buildPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Haputhanthirige Thushara Lahiru Kavishal (st20360354)';
  pptx.title = 'MindCare — Emotion Recognition & Mental Support System Using AI Voice Assistant';
  pptx.subject = 'CSE6035 Development Project (PRES1) — Cardiff Metropolitan University / ICBT Campus';
  pptx.company = 'Cardiff Metropolitan University / ICBT Campus';

  console.log(`Building polished 15-slide presentation deck with Conclusion slide...`);

  for (let i = 0; i < slideFiles.length; i++) {
    const htmlPath = path.join(SLIDES_DIR, slideFiles[i]);
    console.log(`Processing slide ${i + 1}/${slideFiles.length}: ${slideFiles[i]}`);
    try {
      await html2pptx(htmlPath, pptx, { tmpDir: path.join(__dirname, 'tmp') });
    } catch (err) {
      console.error(`ERROR on ${slideFiles[i]}:`, err.message);
    }
  }

  const outputPath = path.join(__dirname, 'MindCare_CSE6035_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`\nPresentation saved: ${outputPath}`);
  console.log(`Total slides compiled: ${slideFiles.length}`);
}

buildPresentation().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
