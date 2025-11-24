use crate::get_invoices;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use typst_as_library::TypstWrapperWorld;
use typst_pdf::PdfOptions;
fn get_template_path() -> Result<PathBuf, String> {
    // ملف القالب داخل resources/templates/invoices.typ
    let resource_path = Path::new("resources")
        .join("templates")
        .join("invoices.typ");
    Ok(resource_path)
}

#[tauri::command]
pub fn generate_invoices_pdf(
    from_date: String,
    to_date: Option<String>,
    customer_id: Option<i32>, // ← إضافة هذا
) -> Result<String, String> {
    let invoices_response = get_invoices(from_date.clone(), to_date.clone(), customer_id)?;

    let template_path = get_template_path()?;
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
    let out_dir = Path::new("invoices");
    if !out_dir.exists() {
        fs::create_dir_all(out_dir).map_err(|e| format!("خطأ بإنشاء المجلد invoices: {}", e))?;
    }
    // كتابة الملف
    let out_path = out_dir.join("invoices_report.pdf");
    fs::write(&out_path, pdf).expect("Error writing PDF file");
    // أرجع المسار كنص
    Ok(out_path.to_string_lossy().to_string())
}
