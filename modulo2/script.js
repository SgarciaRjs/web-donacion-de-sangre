function registro() {
  var nombre = document.getElementById("nombre").value.trim();
  var apellidos = document.getElementById("apellidos").value.trim();
  var correo = document.getElementById("email").value.trim();
  var edad = document.getElementById("edad").value;
  var sangre = document.getElementById("sangre").value;

  var mensaje = document.getElementById("mensaje");

  if (nombre == "" || apellidos == "" || correo == "" || edad == "" || sangre == "") {
    mensaje.innerHTML = "Debe de llenar todos los campos.";
    return;
  }

  mensaje.innerHTML = "Registro exitoso. Nuevo usuario: " + correo;
}