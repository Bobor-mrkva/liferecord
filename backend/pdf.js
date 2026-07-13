const PDFDocument = require('pdfkit');

const COLORS = {
  heading: '#78350f',
  subheading: '#92400e',
  text: '#44403c',
  muted: '#78716c',
  rule: '#fde68a',
};

const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const ruleUnder = (doc) => {
  doc.moveDown(1);
  doc
    .strokeColor(COLORS.rule)
    .lineWidth(1)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();
  doc.moveDown(1);
};

const writeStory = (doc, story) => {
  doc.fontSize(22).fillColor(COLORS.heading).font('Helvetica-Bold').text(story.title);
  doc.moveDown(0.2);
  doc
    .fontSize(10)
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .text(`${story.visibility === 'public' ? 'Public' : 'Private'} story · written ${formatDate(story.created_at)}`);
  ruleUnder(doc);

  if (story.mode === 'freeform') {
    doc.fontSize(12).fillColor(COLORS.text).font('Helvetica').text(story.content || '', { lineGap: 4 });
  } else {
    for (const answer of story.answers || []) {
      doc.fontSize(13).fillColor(COLORS.subheading).font('Helvetica-Bold').text(answer.prompt);
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor(COLORS.text).font('Helvetica').text(answer.answer, { lineGap: 4 });
      doc.moveDown(1);
    }
  }
};

const generateStoryPdf = (story) => {
  const doc = new PDFDocument({ size: 'A4', margin: 56 });
  writeStory(doc, story);
  doc.end();
  return doc;
};

const generateStoriesPdf = (stories, ownerName) => {
  const doc = new PDFDocument({ size: 'A4', margin: 56 });
  doc.fontSize(26).fillColor(COLORS.heading).font('Helvetica-Bold').text(`${ownerName}'s Life Stories`);
  doc
    .fontSize(11)
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .text(`Exported ${formatDate(new Date().toISOString())} · ${stories.length} ${stories.length === 1 ? 'story' : 'stories'}`);

  for (const story of stories) {
    doc.addPage();
    writeStory(doc, story);
  }

  doc.end();
  return doc;
};

const generateFamilyTreePdf = (tree, ownerName) => {
  const doc = new PDFDocument({ size: 'A4', margin: 56 });
  const byId = new Map(tree.bubbles.map((b) => [b.id, b]));

  doc.fontSize(24).fillColor(COLORS.heading).font('Helvetica-Bold').text(`${ownerName}'s Family Tree`);
  doc
    .fontSize(10)
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .text(
      `Exported ${formatDate(new Date().toISOString())} · ${tree.bubbles.length} ${
        tree.bubbles.length === 1 ? 'person' : 'people'
      } · ${tree.connections.length} ${tree.connections.length === 1 ? 'connection' : 'connections'}`
    );
  ruleUnder(doc);

  doc.fontSize(15).fillColor(COLORS.heading).font('Helvetica-Bold').text('People');
  doc.moveDown(0.5);
  if (tree.bubbles.length === 0) {
    doc.fontSize(12).fillColor(COLORS.muted).font('Helvetica').text('No one has been added yet.');
  }
  for (const bubble of tree.bubbles) {
    doc.fontSize(12).fillColor(COLORS.subheading).font('Helvetica-Bold').text(bubble.name);
    const details = [];
    if (bubble.birth_year) details.push(`Born ${bubble.birth_year}`);
    if (bubble.location) details.push(bubble.location);
    if (details.length) {
      doc.fontSize(10).fillColor(COLORS.muted).font('Helvetica').text(details.join(' · '));
    }
    if (bubble.notes) {
      doc.fontSize(11).fillColor(COLORS.text).font('Helvetica').text(bubble.notes, { lineGap: 2 });
    }
    doc.moveDown(0.6);
  }

  if (tree.connections.length > 0) {
    doc.moveDown(0.5);
    doc.fontSize(15).fillColor(COLORS.heading).font('Helvetica-Bold').text('Relationships');
    doc.moveDown(0.5);
    for (const connection of tree.connections) {
      const from = byId.get(connection.from_bubble_id);
      const to = byId.get(connection.to_bubble_id);
      if (!from || !to) continue;
      doc
        .fontSize(12)
        .fillColor(COLORS.text)
        .font('Helvetica')
        .text(`${from.name}  -  ${connection.label}  ->  ${to.name}`);
      doc.moveDown(0.3);
    }
  }

  doc.end();
  return doc;
};

module.exports = { generateStoryPdf, generateStoriesPdf, generateFamilyTreePdf };
