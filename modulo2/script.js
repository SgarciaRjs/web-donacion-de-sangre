function registro() {
  const nombre = document.getElementById("nombre").value.trim();
  const apellidos = document.getElementById("apellidos").value.trim();
  const correo = document.getElementById("email");
  const edad = document.getElementById("edad");
  const sangre = document.getElementById("sangre").value;
  const contrasena = document.getElementById("contrasena").value;
  const confirmarContrasena = document.getElementById("confirmarContrasena").value;
  const mensaje = document.getElementById("mensaje");

  if (!nombre || !apellidos || !correo.value.trim() || !edad.value ||
      !sangre || !contrasena || !confirmarContrasena) {
    mensaje.textContent = "Completá todos los campos.";
    return;
  }

  if (!correo.checkValidity() || !edad.checkValidity()) {
    mensaje.textContent = "Ingresá un correo válido y una edad de al menos 16 años.";
    return;
  }

  if (contrasena.length < 8) {
    mensaje.textContent = "La contraseña debe tener al menos 8 caracteres.";
    return;
  }

  if (contrasena !== confirmarContrasena) {
    mensaje.textContent = "Las contraseñas no coinciden.";
    return;
  }

  mensaje.textContent = "Formulario validado correctamente.";
}