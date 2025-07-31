$(document).ready(function () {
  const table = $("#adminTable").DataTable({
    ajax: "/api/admins/datatables",
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "email" },
      {
        data: "status",
        render: function (data) {
          const badgeClass = data === "active" ? "bg-success" : "bg-danger";
          return `<span class="badge ${badgeClass} text-white">${data}</span>`;
        },
      },
      {
        data: "createdAt",
        render: (data) => new Date(data).toLocaleString("id-ID"),
      },
      {
        data: null,
        render: function (row) {
          const isActive = row.status === "active";
          const btnClass = isActive ? "btn-danger" : "btn-success";
          const btnText = isActive ? "Nonaktifkan" : "Aktifkan";

          return `
              <button class="btn ${btnClass} btn-toggle-status" data-id="${row.id}" data-status="${row.status}">
                ${btnText}
              </button>
              <button class="btn btn-warning btn-edit" data-id="${row.id}" data-name="${row.name}" data-email="${row.email}" data-role="${row.role}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-danger btn-delete" data-id="${row.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            `;
        },
        orderable: false,
      },
    ],
  });

  $("#modalAdmin").on("hidden.bs.modal", function () {
    const form = $("#modalAdmin form")[0];
    if (form) form.reset();

    $("#modalAdmin form").data("mode", "create");
    $("#modalAdmin form").data("id", null);
    $("#passwordWrapper").show();
    $("#modalAdmin .modal-title").text("Tambah Admin");
  });

  $("#modalAdmin form").on("submit", async function (e) {
    e.preventDefault();
    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val();
    const mode = $(this).data("mode") || "create";
    const id = $(this).data("id");

    if (!name || !email || (!password && mode === "create")) {
      Swal.fire("Error", "Nama, email, dan password wajib diisi", "error");
      return;
    }

    try {
      if (mode === "create") {
        await $.post("/api/admins", { name, email, password });
        Swal.fire("Sukses", "Admin berhasil ditambahkan", "success");
      } else {
        await $.ajax({
          url: `/api/admins/${id}`,
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify({ name, email, password }),
        });
        Swal.fire("Sukses", "Admin berhasil diperbarui", "success");
      }

      $("#modalAdmin").modal("hide");
      table.ajax.reload();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan admin", "error");
    }
  });

  $("#adminTable").on("click", ".btn-edit", function () {
    const { id, name, email, role } = $(this).data();
    $("#name").val(name);
    $("#email").val(email);
    $("#adminRole").val(role);
    $("#modalAdmin form").data("mode", "edit").data("id", id);
    $("#modalAdmin .modal-title").text("Edit Admin");
    $("#passwordWrapper").hide();
    $("#modalAdmin").modal("show");
  });

  $("#adminTable").on("click", ".btn-delete", function () {
    const id = $(this).data("id");

    Swal.fire({
      title: "Yakin ingin menghapus admin ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await $.ajax({
            url: `/api/admins/${id}`,
            method: "DELETE",
          });

          Swal.fire("Sukses", "Admin dihapus", "success");
          table.ajax.reload();
        } catch (err) {
          console.error(err);
          Swal.fire("Gagal", "Gagal menghapus admin", "error");
        }
      }
    });
  });

  $("#adminTable").on("click", ".btn-toggle-status", function () {
    const id = $(this).data("id");
    const status = $(this).data("status");

    Swal.fire({
      title: 'Apakah Anda Yakin?',
      html: `Anda akan <strong>${status === "active" ? "menonaktifkan" : "mengaktifkan"}</strong> admin ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, lanjutkan",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await $.ajax({
            url: `/api/admins/${id}/status`,
            method: "PUT",
          });

          Swal.fire("Sukses", "Status admin diperbarui", "success");
          table.ajax.reload();
        } catch (err) {
          console.error(err);
          Swal.fire(
            "Gagal",
            "Terjadi kesalahan saat memperbarui status",
            "error",
          );
        }
      }
    });
  });
});
