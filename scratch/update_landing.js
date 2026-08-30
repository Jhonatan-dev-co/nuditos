/**
 * INSTRUCCIONES:
 * 1. Abre https://nuditos.com.co/admin en tu navegador
 * 2. Inicia sesión con tu cuenta de admin
 * 3. Abre la consola del navegador (F12 > Console)
 * 4. Pega y ejecuta TODO este código
 * 
 * Esto actualizará la landing "/l/regalos-dia-de-la-madre"
 * con contenido enfocado en hombres que quieren sorprender
 * a su ser querido con flores.
 */

(async () => {
  try {
    const result = await sbAdminSaveLanding({
      id: "9eb3b3ac-e3ef-452d-b917-c8081ba9a91e",
      slug: "regalos-para-ella",
      title: "Regalos para Ella | Flores Eternas para Esa Persona Especial | Nuditos",
      is_active: true,
      content: {
        heroImg: "",
        heroBadge: "Detalles que no necesitan excusa 💐",
        heroTitle: "Sorprende a ese ser especial con <em class='italic text-rose-500 font-normal'>flores que duran para siempre</em>",
        targetDate: "",
        categorySlug: "",
        heroSubtitle: "No esperes una fecha. Ella merece un gesto tan duradero como lo que sientes. Ramos artesanales tejidos a mano que decoran su espacio favorito por años. Envío a toda Colombia."
      }
    });
    console.log("✅ Landing actualizada:", result);
    alert("✅ ¡Landing actualizada! Nueva URL: /l/regalos-para-ella");
  } catch(e) {
    console.error("❌ Error:", e);
    alert("❌ Error: " + e.message);
  }
})();
