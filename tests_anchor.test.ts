describe("Pruebas de la Tienda de Música", () => {
  // Calculamos la dirección de la tienda (PDA)
  const [tiendaPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("tienda"), pg.wallet.publicKey.toBuffer()],
    pg.program.programId
  );

  const nombreTienda = "Mi Tienda Musical";

  it("Paso 1: Crear o Verificar la Tienda", async () => {
    try {
      await pg.program.methods
        .crearTienda(nombreTienda)
        .accounts({
          tienda: tiendaPda,
          owner: pg.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      console.log("✅ Tienda creada por primera vez.");
    } catch (err) {
      console.log("ℹ️ La tienda ya existe, verificando datos...");
    }

    const tiendaAccount = await pg.program.account.tienda.fetch(tiendaPda);
    
    // Si assert falla por el paquete, usamos un simple if de JS para el test
    if (tiendaAccount.nombre !== nombreTienda) {
      throw new Error(`El nombre no coincide. Esperado: ${nombreTienda}, Recibido: ${tiendaAccount.nombre}`);
    }
    console.log("🏷️ Nombre confirmado:", tiendaAccount.nombre);
  });

  it("Paso 2: Agregar una Canción", async () => {
    const artista = "Daft Punk";
    const cancionNom = "One More Time";

    await pg.program.methods
      .agregarCancion(artista, cancionNom, "Discovery", 320)
      .accounts({
        tienda: tiendaPda,
        owner: pg.wallet.publicKey,
      })
      .rpc();

    const tiendaData = await pg.program.account.tienda.fetch(tiendaPda);
    const ultima = tiendaData.canciones[tiendaData.canciones.length - 1];
    
    if (ultima.nombre !== cancionNom) {
      throw new Error("La canción no se guardó correctamente");
    }
    
    console.log("🎵 Canción agregada con éxito. Total:", tiendaData.canciones.length);
  });
});
