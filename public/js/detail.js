$(document).ready(function () {
    const optionConfigValidate = {
        debug: false,
        rules: {
            user_name: {
                required: true,
            },
            email: {
                required: true,
                email: true,
            },
            phone: {
                required: true,
            },
        },
        messages: {
            user_name: {
                required: "Không được để trống",
            },
            email: {
                required: "Không được để trống",
                email: "Vui lòng nhập đúng định dạng email",
            },
            phone: {
                required: "Vui lòng nhập thời gian bắt đầu",
            },
        },
        errorElement: 'span',
        errorClass: 'form-input-error',
        submitHandler: function (form) {
            let formData = new FormData(form);

            formData.append('form_session_id', form.dataset.form_session_id);

            $.ajax({
                url: form.action,
                data: formData,
                method: 'POST',
                dataType: 'json',
                processData: false,
                contentType: false,
                beforeSend: function () {
                    $('.loading-wrapper-bg').addClass('show'); // Hiển thị loading nếu cần

                },
                success: function (data) {
                    $('.loading-wrapper-bg').removeClass('show'); // Hiển thị loading nếu cần

                    $('#modalContactPay1').modal('hide');

                    setQrPay2(data.link_qr_code)

                    setIDCode(data.id)

                    $("#formPay1")[0].reset();

                    $("#formPay1").validate().resetForm();

                    $('#modalContactPay2').modal('show');
                },
                error: function (error) {
                    $('.loading-wrapper-bg').removeClass('show'); // Hiển thị loading nếu cần

                    if (error.status === 422) {
                        const listError = error.responseJSON.errors;

                        showErrorResponse(listError);
                    }

                    if (error.status == 302 && error.responseJSON && error.responseJSON.link_redirect) {
                        location.href = error.responseJSON.link_redirect
                        return
                    }

                    if (error.status == 400 && error.responseJSON && error.responseJSON.message) {
                        alert('Không thành công')

                        return
                    }

                    alert('Không thành công')
                }
            });
        }
    };

    const showErrorResponse = (listError) => {

        var errors = {};

        for (var key in listError) {
            if (listError.hasOwnProperty(key)) {
                if (Array.isArray(listError[key])) {
                    errors[key] = listError[key][0];
                }
            }
        }

        $("#formPay1").validate().showErrors(errors);
    }

    $('#formPay1').validate(optionConfigValidate);

    function setQrPay2(qrLink) {
        $('#modalContactPay2 .payment-info .qr img').attr('src', qrLink);
    }

    function setIDCode(id) {
        $('#code-id').val(id);
    }

    const optionConfigValidate2 = {
        debug: false,
        rules: {
            code: {
                required: true,
            }
        },
        messages: {
            code: {
                required: "Không được để trống",
            }
        },
        errorElement: 'span',
        errorClass: 'form-input-error',
        beforeSend: function () {
            $('.loading-wrapper-bg').addClass('show'); // Hiển thị loading nếu cần

        },
        submitHandler: function (form) {
            let formData = new FormData(form);

            $.ajax({
                url: form.action,
                data: formData,
                method: 'POST',
                processData: false,
                contentType: false,
                xhrFields: {
                    responseType: 'blob' // Chỉ định kiểu phản hồi là blob
                },

                success: function (blob) {
                    $('.loading-wrapper-bg').removeClass('show'); // Hiển thị loading nếu cần

                    // Tạo một URL đối tượng từ blob
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'myfile.pdf'; // Tên file khi tải về
                    document.body.appendChild(a);
                    a.click(); // Kích hoạt tải xuống
                    a.remove(); // Xóa link tạm thời
                    window.URL.revokeObjectURL(url); // Giải phóng URL đối tượng

                    $('#formPay3').modal('hide');

                    $("#formPay3")[0].reset();

                    $("#formPay3").validate().resetForm();

                    alert('Tải thành công')

                    $('#modalContactPay3').modal('hide');
                },
                error: function (error) {
                    $('.loading-wrapper-bg').removeClass('show'); // Hiển thị loading nếu cần

                    if (error.status === 422) {
                        const listError = error.responseJSON.errors;

                        showErrorResponse3(listError);
                    }

                    if (error.status == 302 && error.responseJSON && error.responseJSON.link_redirect) {
                        location.href = error.responseJSON.link_redirect
                        return
                    }

                    if (error.status == 400 && error.responseJSON && error.responseJSON.message) {
                        alert('Không thành công')

                        return
                    }

                    alert('Không thành công')
                }
            });
        }
    };

    const showErrorResponse3 = (listError) => {
        console.log(1);

        var errors = {};

        for (var key in listError) {
            if (listError.hasOwnProperty(key)) {
                if (Array.isArray(listError[key])) {
                    errors[key] = listError[key][0];
                }
            }
        }

        $("#formPay3").validate().showErrors(errors);
    }

    $('#formPay3').validate(optionConfigValidate2);

    $('#button-open-step3').click(function () {
        $('#modalContactPay2').modal('hide');

        $('#modalContactPay3').modal('show');
    })
});