/* PANELES ADMINISTRATIVOS (Integrante 4) — comportamiento solo del lado del cliente.
   No hay base de datos: todo lo que "se guarda" es una simulación con un aviso. */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Avisos ---------- */
  function aviso(texto) {
    var cont = $('#avisos');
    if (!cont) { return; }
    var el = document.createElement('div');
    el.className = 'aviso';
    el.textContent = texto;
    cont.appendChild(el);
    setTimeout(function () {
      el.classList.add('sale');
      setTimeout(function () { el.remove(); }, 250);
    }, 3200);
  }

  $$('[data-simula]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      aviso(b.getAttribute('data-simula'));
    });
  });

  /* ---------- Busqueda y filtros de tablas ---------- */
  $$('table[data-tabla]').forEach(function (tabla) {
    var controles = $$('[data-filtra="#' + tabla.id + '"]');
    var vacio = $('.fila-vacia', tabla);

    function aplicar() {
      var visibles = 0;
      $$('tbody tr[data-fila]', tabla).forEach(function (tr) {
        var ok = controles.every(function (c) {
          var v = c.value.trim().toLowerCase();
          if (!v) { return true; }
          var attr = c.getAttribute('data-attr');
          if (attr) { return (tr.getAttribute('data-' + attr) || '').toLowerCase() === v; }
          return (tr.getAttribute('data-buscar') || tr.textContent).toLowerCase().indexOf(v) !== -1;
        });
        tr.hidden = !ok;
        if (ok) { visibles++; }
      });
      if (vacio) { vacio.hidden = visibles > 0; }
    }

    controles.forEach(function (c) { c.addEventListener('input', aplicar); });
  });

  /* ---------- Formularios con validacion ---------- */
  $$('form.needs-validation').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      f.classList.add('was-validated');
      if (!f.checkValidity()) {
        var primero = $(':invalid', f);
        if (primero) { primero.focus(); }
        return;
      }
      aviso(f.getAttribute('data-ok') || 'Guardado (simulado).');
    });
  });

  /* ---------- Formulario de campana: precarga, vista previa y horas ---------- */
  var formCampana = $('#formCampana');
  if (formCampana) {
    var CAMPANAS = {
      1: { nombre: 'Jornada Heredia Centro', descripcion: 'Jornada abierta a la comunidad en el centro de Heredia.', lugar: 'Salón comunal, Heredia centro', fecha: '2026-11-14', inicio: '08:00', fin: '14:00', estado: 'activa' },
      2: { nombre: 'Campaña Universitaria de Otoño', descripcion: 'Campaña dirigida a estudiantes y personal universitario.', lugar: 'Auditorio principal del campus', fecha: '2026-11-28', inicio: '09:00', fin: '15:00', estado: 'activa' },
      3: { nombre: 'Donación en Parque Central', descripcion: '', lugar: 'Parque Central de Heredia', fecha: '2026-12-12', inicio: '09:00', fin: '13:00', estado: 'borrador' }
    };

    var f = formCampana.elements;
    var id = new URLSearchParams(window.location.search).get('id');
    var datos = id && CAMPANAS[id];

    if (datos) {
      f.nombre.value = datos.nombre;
      f.descripcion.value = datos.descripcion;
      f.lugar.value = datos.lugar;
      f.fecha.value = datos.fecha;
      f.inicio.value = datos.inicio;
      f.fin.value = datos.fin;
      f.estado.value = datos.estado;
      $('#tituloForm').textContent = 'Editar campaña';
      $('#descForm').textContent = 'Modifica los datos de la campaña y guarda los cambios.';
      $('#btnGuardar').firstChild.nodeValue = 'Guardar cambios ';
      formCampana.setAttribute('data-ok', 'Cambios guardados (simulado).');
    } else {
      var hoy = new Date();
      var iso = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
      f.fecha.min = iso;
      formCampana.setAttribute('data-ok', 'Campaña creada (simulado).');
    }

    function fechaLarga(v) {
      if (!v) { return 'Sin definir'; }
      return new Date(v + 'T00:00:00').toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    var ETIQUETAS = { borrador: 'Borrador', activa: 'Activa', finalizada: 'Finalizada', cancelada: 'Cancelada' };

    function actualizar() {
      $('#vNombre').textContent = f.nombre.value.trim() || 'Nombre de la campaña';
      $('#vFecha').textContent = fechaLarga(f.fecha.value);
      $('#vLugar').textContent = f.lugar.value.trim() || 'Sin definir';
      $('#vHorario').textContent = (f.inicio.value && f.fin.value) ? f.inicio.value + ' a ' + f.fin.value : 'Sin definir';
      var chip = $('#vEstado');
      chip.textContent = ETIQUETAS[f.estado.value];
      chip.className = 'chip chip-' + f.estado.value;
      $('#contador').textContent = f.descripcion.value.length + ' / 400';
      f.fin.setCustomValidity(f.inicio.value && f.fin.value && f.fin.value <= f.inicio.value ? 'La hora de fin debe ser posterior a la de inicio.' : '');
    }
    formCampana.addEventListener('input', actualizar);
    actualizar();
  }

  /* ---------- Registro de asistencia ---------- */
  var tAsis = $('#tablaAsistencia');
  if (tAsis) {
    var filas = $$('tbody tr[data-fila]', tAsis);

    function contar() {
      var a = 0, n = 0, p = 0;
      filas.forEach(function (tr) {
        var marcado = $('input:checked', tr);
        var v = marcado ? marcado.value : 'pend';
        if (v === 'asistio') { a++; } else if (v === 'no') { n++; } else { p++; }
      });
      $('#cAsistio').textContent = a;
      $('#cNo').textContent = n;
      $('#cPend').textContent = p;
      var hechos = a + n;
      $('#barraProgreso').style.width = (filas.length ? Math.round(hechos / filas.length * 100) : 0) + '%';
      $('#textoProgreso').textContent = hechos + ' de ' + filas.length + ' donantes con asistencia registrada';
    }

    tAsis.addEventListener('change', contar);

    function marcarTodos(valor) {
      filas.forEach(function (tr) {
        if (tr.hidden) { return; }
        var r = $('input[value="' + valor + '"]', tr);
        if (r) { r.checked = true; }
      });
      contar();
    }
    $('#marcarTodos').addEventListener('click', function () { marcarTodos('asistio'); });
    $('#limpiarTodos').addEventListener('click', function () { marcarTodos('pend'); });

    $('#selCampana').addEventListener('change', function (e) {
      $('#nombreCampana').textContent = e.target.options[e.target.selectedIndex].text;
      marcarTodos('pend');
    });

    $('#guardarAsistencia').addEventListener('click', function () {
      aviso('Asistencia guardada (simulado): ' + $('#cAsistio').textContent + ' asistieron, ' + $('#cNo').textContent + ' no asistieron.');
    });
    contar();
  }

  /* ---------- Usuarios y roles ---------- */
  var modalEl = $('#modalRol');
  if (modalEl) {
    var pendiente = null;
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    function confirmarRol(sel) {
      sel.setAttribute('data-previo', sel.value);
      sel.closest('tr').setAttribute('data-rol', sel.value);
      aviso('Rol de ' + sel.getAttribute('data-nombre') + ' cambiado a ' + sel.options[sel.selectedIndex].text.toLowerCase() + ' (simulado).');
    }

    $$('.rol-select').forEach(function (sel) {
      sel.setAttribute('data-previo', sel.value);
      sel.addEventListener('change', function () {
        if (sel.value === 'administrador') {
          pendiente = sel;
          $('#modalRolNombre').textContent = sel.getAttribute('data-nombre');
          modal.show();
        } else {
          confirmarRol(sel);
        }
      });
    });

    $('#confirmarRol').addEventListener('click', function () {
      if (pendiente) { confirmarRol(pendiente); pendiente = null; }
      modal.hide();
    });

    modalEl.addEventListener('hidden.bs.modal', function () {
      if (pendiente) { pendiente.value = pendiente.getAttribute('data-previo'); pendiente = null; }
    });

    $$('.estado-switch').forEach(function (sw) {
      sw.addEventListener('change', function () {
        var tr = sw.closest('tr');
        tr.setAttribute('data-estado', sw.checked ? 'activo' : 'inactivo');
        tr.classList.toggle('inactivo', !sw.checked);
        $('.estado-texto', tr).textContent = sw.checked ? 'Activo' : 'Inactivo';
        aviso('Usuario ' + (sw.checked ? 'activado' : 'desactivado') + ' (simulado).');
      });
    });
  }

  /* ---------- Reportes: exportar CSV e imprimir ---------- */
  var botonCsv = $('#exportarCsv');
  if (botonCsv) {
    botonCsv.addEventListener('click', function () {
      var tabla = $('#tablaReporte');
      var celda = function (t) { return '"' + t.replace(/\s+/g, ' ').trim().replace(/"/g, '""') + '"'; };
      var lineas = [$$('thead th', tabla).map(function (th) { return celda(th.textContent); }).join(',')];
      $$('tbody tr[data-fila]', tabla).forEach(function (tr) {
        if (tr.hidden) { return; }
        lineas.push($$('td', tr).map(function (td) { return celda(td.textContent); }).join(','));
      });
      var blob = new Blob(['﻿' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'reporte-campanas.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      aviso('Reporte exportado como CSV.');
    });
    $('#imprimir').addEventListener('click', function () { window.print(); });
  }
})();
