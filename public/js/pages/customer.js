$(document).ready(function () {
  // Inisialisasi DataTable
  const table = $("#dataTable").DataTable({
    ajax: "/api/customers/datatables",
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "phone" },
      {
        data: "createdAt",
        render: function (data) {
          return new Date(data).toLocaleDateString("id-ID");
        },
      },
      {
        data: "status",
        render: function (data) {
          const badgeClass =
            data === "active" ? "bg-success" : "bg-danger";
          return `<span class="badge ${badgeClass} text-uppercase text-white">${data}</span>`;
        },
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
             <button class="btn btn-warning btn-edit" data-id="${row.id}" data-name="${row.name}" data-phone="${row.phone}">
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

  // Reset modal saat ditutup
  $("#modalCreateCustomer").on("hidden.bs.modal", function () {
    const form = $("#modalCreateCustomer form")[0];
    if (form) form.reset();

    $("#modalCreateCustomer form").data("mode", "create");
    $("#modalCreateCustomer form").data("id", null);
    $("#modalCreateCustomer .modal-title").text("Tambah Pengguna");
    $('#modalCreateCustomer button[type="submit"]')
      .html(
        `
       <i class="fas fa-paper-plane"></i> Kirim
     `,
      )
      .prop("disabled", false);
  });

  // Submit form: Create / Update
  $("#modalCreateCustomer form").on("submit", async function (e) {
    e.preventDefault();

    const name = $("#name").val().trim();
    const phone = $("#phone").val().trim();
    const mode = $(this).data("mode") || "create";
    const id = $(this).data("id");
    const $submitBtn = $(this).find('button[type="submit"]');
    const originalBtnHtml = $submitBtn.html();

    if (!name || !phone) {
      Swal.fire("Error", "Nama dan nomor WhatsApp wajib diisi", "error");
      return;
    }

    $submitBtn.prop("disabled", true).html(`
       <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
       Menyimpan...
     `);

    try {
      if (mode === "create") {
        await $.post("/api/customers", { name, phone });
        Swal.fire("Sukses", "Pengguna berhasil ditambahkan", "success");
      } else {
        await $.ajax({
          url: `/api/customers/${id}`,
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify({ name, phone }),
        });
        Swal.fire("Sukses", "Pengguna berhasil diperbarui", "success");
      }

      $("#modalCreateCustomer").modal("hide");
      table.ajax.reload();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan", "error");
      $submitBtn.prop("disabled", false).html(originalBtnHtml);
    }
  });

  // Tombol Edit
  $("#dataTable").on("click", ".btn-edit", function () {
    const id = $(this).data("id");
    const name = $(this).data("name");
    const phone = $(this).data("phone");

    $("#name").val(name);
    $("#phone").val(phone);
    $("#modalCreateCustomer form").data("mode", "edit").data("id", id);
    $("#modalCreateCustomer .modal-title").text("Edit Pengguna");
    $("#modalCreateCustomer").modal("show");
  });

  // Tombol Hapus
  $("#dataTable").on("click", ".btn-delete", function () {
    const id = $(this).data("id");

    Swal.fire({
      title: "Yakin ingin menghapus pengguna ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await $.ajax({
            url: `/api/customers/${id}`,
            method: "DELETE",
          });

          Swal.fire("Sukses", "Pengguna dihapus", "success");
          table.ajax.reload();
        } catch (err) {
          console.error(err);
          Swal.fire("Gagal", "Gagal menghapus pengguna", "error");
        }
      }
    });
  });

  $("#dataTable").on("click", ".btn-toggle-status", function () {
    const id = $(this).data("id");
    const status = $(this).data("status");

    Swal.fire({
      title: 'Apakah Anda Yakin?',
      html: `Anda akan <strong>${status === "active" ? "menonaktifkan" : "mengaktifkan"}</strong> pengguna ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, lanjutkan",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await $.ajax({
            url: `/api/customers/${id}/status`,
            method: "PUT",
          });

          Swal.fire("Sukses", "Status pengguna diperbarui", "success");
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
