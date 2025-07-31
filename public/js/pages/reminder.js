$(document).ready(function () {
  const table = $("#reminderTable").DataTable({
    ajax: "/api/reminders/datatables",
    columns: [
      { data: "message" },
      { data: "cron" },
      {
        data: "status",
        render: (status) =>
          `<span class="badge text-white bg-${
            status === "active" ? "success" : "danger"
          }">${status}</span>`,
      },
      {
        data: "createdAt",
        render: (date) => new Date(date).toLocaleString("id-ID"),
      },
      {
        data: null,
        render: (row) => {
          const isActive = row.status === "active";
          const btnClass = isActive ? "btn-danger" : "btn-success";
          const btnText = isActive ? "Nonaktifkan" : "Aktifkan";

          return `
            <button class="btn ${btnClass} btn-toggle-status mb-1" data-id="${row.id}" data-status="${row.status}">
              ${btnText}
            </button> <br />
            <button class="btn btn-warning btn-edit" data-id="${row.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-delete" data-id="${row.id}"><i class="fas fa-trash-alt"></i></button>
          `;
        },
        orderable: false,
      },
    ],
  });

  $("#formReminder").on("submit", async function (e) {
    e.preventDefault();
    const id = $("#reminderId").val();
    const message = $("#message").val();
    const cron = $("#cron").val();
    const status = $("#status").val();

    const $submitBtn = $(this).find('button[type="submit"]');
    const originalBtnHtml = $submitBtn.html();

    if (!message || !cron) {
      Swal.fire("Error", "Pesan dan Cron Expression wajib diisi", "error");
      return;
    }

    const payload = {
      message: message,
      cron: cron,
      status: status,
    };

    $submitBtn.prop("disabled", true).html(`
      <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
      Menyimpan...
    `);

    try {
      if (id) {
        await $.ajax({
          url: `/api/reminders/${id}`,
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify(payload),
        });
        Swal.fire("Berhasil", "Jadwal berhasil diperbarui", "success");
      } else {
        await $.post("/api/reminders", payload);
        Swal.fire("Berhasil", "Jadwal berhasil ditambahkan", "success");
      }

      $("#modalReminder").modal("hide");
      table.ajax.reload();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Gagal menyimpan jadwal", "error");
    } finally {
      $submitBtn.prop('disabled', false).html(originalBtnHtml);
    }
  });

  $("#reminderTable").on("click", ".btn-edit", async function () {
    const id = $(this).data("id");
    const { data } = await $.get(`/api/reminders/${id}`);
    $("#reminderId").val(data.id);
    $("#message").val(data.message);
    $("#cron").val(data.cron);
    $("#status").val(data.status);
    $("#modalReminder").modal("show");
  });

  $("#reminderTable").on("click", ".btn-delete", function () {
    const id = $(this).data("id");
    Swal.fire({
      title: "Hapus Jadwal?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await $.ajax({ url: `/api/scheduler/${id}`, method: "DELETE" });
          table.ajax.reload();
          Swal.fire("Dihapus", "Jadwal berhasil dihapus", "success");
        } catch (err) {
          console.error(err);
          Swal.fire("Gagal", "Gagal menghapus jadwal", "error");
        }
      }
    });
  });

  $('#reminderTable').on('click', '.btn-toggle-status', function () {
    const id = $(this).data('id');
    const status = $(this).data('status');

    Swal.fire({
      title: 'Apakah Anda Yakin?',
      html: `Anda akan <strong>${status === "active" ? "menonaktifkan" : "mengaktifkan"}</strong> jadwal ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, lanjutkan",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await $.ajax({
            url: `/api/reminders/${id}/status`,
            method: "PUT",
          });

          Swal.fire("Sukses", "Status jadwal diperbarui", "success");
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
