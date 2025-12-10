const fichaModel = require('../models/ficha.model');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// 1. Crear nueva ficha (POST)
const createFicha = async (req, res) => {
    try {
        const newFicha = await fichaModel.create(req.body);
        return res.status(201).json({
            message: 'Ficha médica registrada.',
            ficha: newFicha
        });
    } catch (error) {
        console.error('Error al crear ficha médica:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// 2. Obtener historial por ID de Mascota (GET)
const getFichasByMascota = async (req, res) => {
    const { idMascota } = req.params;
    try {
        const fichas = await fichaModel.findByMascotaId(idMascota);
        return res.status(200).json(fichas);
    } catch (error) {
        console.error('Error al obtener fichas por mascota:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// GET /api/fichas/:id - Obtener detalle de una ficha
const getFichaById = async (req, res) => {
    const { id } = req.params;
    try {
        const ficha = await fichaModel.findById(id);
        if (!ficha) {
            return res.status(404).json({ message: 'Ficha no encontrada.' });
        }
        res.status(200).json(ficha);
    } catch (error) {
        console.error('Error al obtener ficha:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Generar PDF de una ficha médica
const generateFichaPdf = async (req, res) => {
    const { id } = req.params; // ID de la ficha a reportar

    try {
        // 1. Obtener los datos completos de la ficha (usamos findById)
        const ficha = await fichaModel.findById(id);

        if (!ficha) {
            return res.status(404).json({ message: 'Ficha médica no encontrada.' });
        }

        // 2. Configurar la respuesta como un archivo PDF
        const doc = new PDFDocument();
        const filename = `Ficha_Medica_${id}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe (canalizar) el documento PDF al stream de respuesta HTTP
        doc.pipe(res);

        // 3. Generación del Contenido (Diseño profesional)

        doc.fontSize(16).text('CLÍNICA VETERINARIA VET-APP', { align: 'center' });
        doc.fontSize(12).text('REPORTE CLÍNICO', { align: 'center' }).moveDown();
        doc.lineWidth(1).strokeColor('#007bff').moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

        // --- Info Básica ---
        doc.fontSize(10)
            .text(`Ficha N°: ${ficha.id}`, 50, doc.y)
            .text(`Fecha de Consulta: ${new Date(ficha.fecha_consulta).toLocaleDateString()}`, 300, doc.y)
            .moveDown(0.5);

        // --- Sección Mascota/Dueño (Necesita JOIN o datos si tu findById los trae) ---
        // NOTA: Si tu findById no trae el nombre de la mascota, necesitarás un JOIN en el modelo.
        doc.fontSize(10)
            .text(`ID Mascota: ${ficha.id_mascota}`, 50, doc.y)
            .text(`Veterinario ID: ${ficha.id_veterinario}`, 300, doc.y)
            .moveDown(2);

        // --- Detalle Clínico ---
        doc.fontSize(12).text('MOTIVO DE CONSULTA:', 50, doc.y).fillColor('#007bff');
        doc.fontSize(10).fillColor('black').text(ficha.motivo_consulta, {
            indent: 20,
            align: 'justify'
        }).moveDown();

        doc.fontSize(12).text('DIAGNÓSTICO:', 50, doc.y).fillColor('#007bff');
        doc.fontSize(10).fillColor('black').text(ficha.diagnostico, {
            indent: 20,
            align: 'justify'
        }).moveDown();

        doc.fontSize(12).text('TRATAMIENTO Y NOTAS:', 50, doc.y).fillColor('#007bff');
        doc.fontSize(10).fillColor('black').text(ficha.tratamiento, {
            indent: 20,
            align: 'justify'
        }).moveDown(3);

        doc.fontSize(9).text('Reporte generado automáticamente por VET-APP.', { align: 'right' });


        // 4. Finalizar el documento
        doc.end();

    } catch (error) {
        console.error('Error durante la generación del PDF:', error);
        res.status(500).json({ message: 'Error interno al generar el reporte.' });
    }
};

module.exports = {
    createFicha,
    getFichasByMascota,
    getFichaById,
    generateFichaPdf,
};