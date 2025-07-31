$(document).ready(function () {
  function fetchQr() {
    $.get("/api/whatsapp/qr", function (data) {
      if (data.isReady) {
        $('#qr-img-wrapper').hide();

        $('#loading-wrapper #spinner').hide();
        
        $("#loading-wrapper #status").text("");
        $('.alert').removeClass('d-none');
        $("#logout-btn").show();
      } else if (data.qr) {
        $("#qr-img").attr("src", data.qr).show();
        $('#qr-img-wrapper').show();

        $('#loading-wrapper #spinner').hide();

        $("#loading-wrapper #status").text("Scan QR untuk login WhatsApp");

        $('.alert').addClass('d-none')
        $("#logout-btn").hide();
      } else {
        $('.alert').hide()
        $("#logout-btn").hide();

        $('#loading-wrapper #spinner').show();
        $("#loading-wrapper #status").text("Menunggu QR...");
      }
    }).fail(function () {
      console.error("Error fetching QR.");
    });
  }

  // Event handler untuk tombol logout
  $("#logout-btn").on("click", function () {
    $.post("/api/whatsapp/logout", function () {
      alert("Logout berhasil, halaman akan dimuat ulang.");
      location.reload();
    });
  });

  // Jalankan fungsi setiap 10 detik dan saat halaman pertama kali dimuat
  setInterval(fetchQr, 10000);
  fetchQr();
});
