// ═══════════════════════════════════════════════════════════
// WorkLink UMG - Google Apps Script Email Relay
// Despliega este script como Web App desde script.google.com
// ═══════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject,
      htmlBody: data.htmlBody,
      name: "WorkLink UMG"
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "WorkLink UMG Email Relay activo" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Función de prueba (ejecutar manualmente para verificar)
function testEmail() {
  MailApp.sendEmail({
    to: "jalvaradov12@miumg.edu.gt",
    subject: "✅ WorkLink UMG - Prueba de conexión",
    htmlBody: "<h2 style='color:#003057;'>¡Conexión exitosa!</h2><p>El servicio de correo de WorkLink UMG está funcionando correctamente.</p>",
    name: "WorkLink UMG"
  });
  Logger.log("Email de prueba enviado exitosamente");
}
