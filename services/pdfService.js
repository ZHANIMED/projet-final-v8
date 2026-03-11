const PDFDocument = require('pdfkit');
const stream = require('stream');

/**
 * Generates a PDF invoice for the given order.
 * @param {Object} order - Order document populated with items, user, etc.
 * @returns {Promise<Buffer>} - PDF data as a Buffer.
 */
function generateInvoicePdf(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc
                .fontSize(20)
                .text('Facture', { align: 'center' })
                .moveDown();

            // Order info
            doc.fontSize(12).text(`Commande #: ${order._id}`);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
            if (order.user && order.user.name) {
                doc.text(`Client: ${order.user.name}`);
            }
            doc.moveDown();

            // Table header
            doc.font('Helvetica-Bold');
            doc.text('Produit', 50, doc.y, { width: 200 });
            doc.text('Quantité', 260, doc.y, { width: 80, align: 'right' });
            doc.text('Prix', 350, doc.y, { width: 80, align: 'right' });
            doc.text('Total', 440, doc.y, { width: 80, align: 'right' });
            doc.moveDown();
            doc.font('Helvetica');

            // Items
            order.items.forEach(item => {
                const total = item.price * item.qty;
                doc.text(item.title, 50, doc.y, { width: 200 });
                doc.text(item.qty.toString(), 260, doc.y, { width: 80, align: 'right' });
                doc.text(item.price.toFixed(2) + ' €', 350, doc.y, { width: 80, align: 'right' });
                doc.text(total.toFixed(2) + ' €', 440, doc.y, { width: 80, align: 'right' });
                doc.moveDown();
            });

            doc.moveDown();
            doc.font('Helvetica-Bold');
            doc.text(`Total à payer: ${order.total.toFixed(2)} €`, { align: 'right' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { generateInvoicePdf };
