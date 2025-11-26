use crate::{get_invoices, get_transactions};
use std::fs;
use tauri::Manager;
// use tauri::{AppHandle, Manager};
use typst_as_library::TypstWrapperWorld;
use typst_pdf::PdfOptions;

fn get_template_path(app_handle: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let base_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("فشل في تحديد مجلد الموارد: {}", e))?;

    // في Tauri v2، سواء في dev أو build، الملفات تكون داخل `resources/`
    // لكن في dev، `resource_dir()` يُرجع src-tauri/، لذا نحتاج إضافة "resources"
    let template_path = base_dir
        .join("resources")
        .join("templates")
        .join("invoices.typ");

    if !template_path.exists() {
        eprintln!("⚠️  لم يُعثر على ملف القالب في: {}", template_path.display());
        return Err("ملف القالب (invoices.typ) غير موجود في resources/templates/".into());
    }

    Ok(template_path)
}

fn get_transactions_path(app_handle: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let base_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("فشل في تحديد مجلد الموارد: {}", e))?;

    // في Tauri v2، سواء في dev أو build، الملفات تكون داخل `resources/`
    // لكن في dev، `resource_dir()` يُرجع src-tauri/، لذا نحتاج إضافة "resources"
    let template_path = base_dir
        .join("resources")
        .join("templates")
        .join("transactions.typ");

    if !template_path.exists() {
        eprintln!("⚠️  لم يُعثر على ملف القالب في: {}", template_path.display());
        return Err("ملف القالب (transactions.typ) غير موجود في resources/templates/".into());
    }

    Ok(template_path)
}

#[tauri::command]
pub fn generate_invoices_pdf(
    app_handle: tauri::AppHandle, // ← هذا يُمرَّر تلقائيًا من Tauri
    from_date: String,
    to_date: Option<String>,
    customer_id: Option<i32>, // ← إضافة هذا
) -> Result<String, String> {
    let invoices_response = get_invoices(from_date.clone(), to_date.clone(), customer_id)?;

    let template_path = get_template_path(&app_handle)?;

    println!("Template path: {:?}", template_path);
    let template = fs::read_to_string(&template_path)
        .expect(&format!("Error reading {}", template_path.display()));
    let invoices = invoices_response.data;
    let rows: String = invoices
        .iter()
        .map(|inv| {
            format!(
                r#"("", "{:.2}", "{}", "{}", "{}")"#,
                inv.total,
                inv.customer_phone.as_deref().unwrap_or(""),
                inv.customer_address.as_deref().unwrap_or(""),
                inv.customer_name.as_deref().unwrap_or("")
            )
        })
        .collect::<Vec<String>>()
        .join(",\n");
    // This is a placeholder function.
    let content = template
        .replace("{rows}", &rows)
        .replace("{total}", &format!("{:.2}", invoices_response.total))
        .replace("{company_name}", "شركة المثال")
        .replace("{phone}", "0551234567")
        .replace("{address}", "الرياض")
        .replace("{from_date}", &from_date.as_str())
        .replace("{to_date}", to_date.as_deref().unwrap_or(""));

    // Create Typst world with content
    let world = TypstWrapperWorld::new("../".to_string(), content);

    // Compile Typst document
    let document = typst::compile(&world)
        .output
        .expect("Error compiling Typst");

    // Export to PDF
    let pdf = typst_pdf::pdf(&document, &PdfOptions::default()).expect("Error exporting PDF");
    // Ensure directory exists
    // fs::create_dir_all("invoices").expect("Failed to create invoices directory");
    // تأكد من مجلد الإخراج
    let out_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("فشل في تحديد مجلد البيانات: {}", e))?
        .join("invoices");

    std::fs::create_dir_all(&out_dir).map_err(|e| format!("فشل في إنشاء مجلد الإخراج: {}", e))?;

    let out_path = out_dir.join("invoices_report.pdf");
    std::fs::write(&out_path, pdf).map_err(|e| format!("فشل في حفظ ملف PDF: {}", e))?;

    Ok(out_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn generate_transactions_pdf(
    app_handle: tauri::AppHandle, // ← هذا يُمرَّر تلقائيًا من Tauri
    customer_id: i32,             // ← إضافة هذا
    customer_name: String,
    customer_phone: String,
    customer_address: String,
    from_date: String,
    to_date: Option<String>,
) -> Result<String, String> {
    let transactions_response = get_transactions(customer_id, from_date.clone(), to_date.clone())?;
    let template_path = get_transactions_path(&app_handle)?;

    println!("Template path: {:?}", template_path);
    let template = fs::read_to_string(&template_path)
        .expect(&format!("Error reading {}", template_path.display()));
    let transactions = transactions_response.data;
    let rows: String = transactions
        .iter()
        .map(|inv| {
            let transaction_label = if inv.transaction_type == "payment" {
                "دفعة"
            } else {
                "فاتورة"
            };
            format!(
                r#"("{:.2}", "{}", "{}", "{}")"#,
                inv.amount,
                transaction_label,
                inv.date,
                inv.reference.as_deref().unwrap_or("")
            )
        })
        .collect::<Vec<String>>()
        .join(",\n");
    let content = template
        .replace("{rows}", &rows)
        .replace(
            "{total_invoices}",
            &format!("{:.2}", transactions_response.total_invoices),
        )
        .replace(
            "{total_payments}",
            &format!("{:.2}", transactions_response.total_payments),
        )
        .replace(
            "{remaining_total}",
            &format!("{:.2}", transactions_response.remaining_total),
        )
        .replace("{name}", &customer_name)
        .replace("{phone}", &customer_phone)
        .replace("{address}", &customer_address)
        .replace("{from_date}", &from_date.as_str())
        .replace("{to_date}", to_date.as_deref().unwrap_or(""));

    // Create Typst world with content
    let world = TypstWrapperWorld::new("../".to_string(), content);

    // Compile Typst document
    let document = typst::compile(&world)
        .output
        .expect("Error compiling Typst");

    // Export to PDF
    let pdf = typst_pdf::pdf(&document, &PdfOptions::default()).expect("Error exporting PDF");
    // Ensure directory exists

    // تأكد من مجلد الإخراج
    let out_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("فشل في تحديد مجلد البيانات: {}", e))?
        .join("transactions");

    std::fs::create_dir_all(&out_dir).map_err(|e| format!("فشل في إنشاء مجلد الإخراج: {}", e))?;

    let out_path = out_dir.join("transactions_report.pdf");
    std::fs::write(&out_path, pdf).map_err(|e| format!("فشل في حفظ ملف PDF: {}", e))?;

    Ok(out_path.to_string_lossy().to_string())
}
