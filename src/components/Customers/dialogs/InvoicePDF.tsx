import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Customer, TransactionsReport } from "@/types";
// Register Arabic font
Font.register({
  family: "Cairo",
  fonts: [
    {
      src: "/fonts/Cairo/Cairo-Regular.ttf",
      fontStyle: "normal",
      fontWeight: 400,
    },
    {
      src: "/fonts/Cairo/Cairo-Medium.ttf",
      fontStyle: "normal",
      fontWeight: 700,
    },
  ],
});
// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    direction: "rtl",
    fontFamily: "Cairo",
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 700,
  },

  section: {
    marginBottom: 20,
    direction: "rtl",
  },

  sectionTitle: {
    fontSize: 10,
    marginBottom: 4,
    borderBottom: "1px solid #e7e3e4",
    paddingBottom: 2,
    direction: "rtl",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e7e3e4",
    marginBottom: 20,
  },

  tableRow: {
    flexDirection: "row-reverse",
    borderBottom: "1px solid #e7e3e4",
  },

  tableCellHeader: {
    flex: 1,
    padding: 6,
    paddingHorizontal: 4,
    backgroundColor: "#f0f0f0",
    borderRight: "1px solid #e7e3e4",
    fontSize: 8,
    direction: "rtl",
    fontWeight: 800,
  },

  tableCell: {
    flex: 1,
    padding: 4,
    borderRight: "1px solid #e7e3e4",
    fontSize: 8,
    direction: "rtl",
  },

  tableCellLast: {
    borderRight: 0,
  },

  totalsBox: {
    width: 200,
    marginRight: "auto",
  },

  totalRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e7e3e4",
    paddingVertical: 4,
  },

  footer: {
    marginTop: 40,
    borderTop: "1px solid #e7e3e4",
    paddingTop: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#555",
  },
});
interface Props {
  data: TransactionsReport;
  customer: Customer;
  formDate: string;
  toDate?: string;
}
export default function InvoicePDF({
  data,
  customer,
  formDate,
  toDate,
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={{ ...styles.title, fontWeight: 700 }}>
            تقرير المعاملات
          </Text>
          {/* <Text style={{ direction: "rtl", fontSize: 10, color: "#4a5565" }}>
            رقم الفاتورة: {invoice.invoice_number}
          </Text> */}
        </View>

        {/* Customer + Invoice Info */}
        <View
          style={{
            flexDirection: "row-reverse",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: "48%",
              direction: "rtl",
            }}
          >
            <Text style={styles.sectionTitle}>معلومات العميل</Text>
            <Text style={{ direction: "rtl", fontSize: 8 }}>
              الاسم: {customer?.name}
            </Text>

            <Text style={{ direction: "rtl", fontSize: 8 }}>
              رقم الهاتف: {customer?.phone}
            </Text>
          </View>

          <View style={{ width: "48%", direction: "rtl" }}>
            <Text style={styles.sectionTitle}>تفاصيل الفاتورة</Text>
            <Text style={{ direction: "rtl", fontSize: 8 }}>
              التاريخ: {toDate ? `${formDate} إلى ${toDate}` : formDate}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={{ ...styles.section, marginTop: 16 }}>
          <Text style={styles.sectionTitle}>قائمة المعاملات</Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCellHeader,
                  styles.tableCellLast,
                  {
                    paddingHorizontal: 10,
                    flexGrow: 0,
                    flexShrink: 0,
                  },
                ]}
              ></Text>
              <Text style={[styles.tableCellHeader]}>#</Text>
              {/* <Text style={styles.tableCellHeader}>اسم العميل</Text>
              <Text style={styles.tableCellHeader}>رقم الهاتف</Text> */}
              <Text style={styles.tableCellHeader}>التاريخ</Text>
              <Text style={[styles.tableCellHeader]}>نوع المعاملة</Text>
              <Text style={[styles.tableCellHeader]}>الإجمالي</Text>
            </View>

            {data.data.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellLast,
                    {
                      paddingHorizontal: 10,
                      flexGrow: 0,
                      flexShrink: 0,
                    },
                  ]}
                ></Text>
                <Text style={[styles.tableCell]}>{item?.reference || "-"}</Text>
                {/* <Text style={styles.tableCell}>{item?.customer_name}</Text>
                <Text style={styles.tableCell}>{item?.customer_phone}</Text> */}
                <Text style={styles.tableCell}>{item?.date}</Text>
                <Text style={styles.tableCell}>
                  {item?.transaction_type == "payment" ? "دفعة" : "فاتورة"}
                </Text>

                <Text style={[styles.tableCell]}>
                  {item?.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={{ ...styles.totalRow }}>
            <Text
              style={{
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              مجموع الفواتير:
            </Text>
            <Text style={{ fontSize: 12 }}>
              {data?.total_invoices.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.totalsBox}>
          <View style={{ ...styles.totalRow }}>
            <Text
              style={{
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              مجموع المدفوعات:
            </Text>
            <Text style={{ fontSize: 12 }}>
              {data?.total_payments.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.totalsBox}>
          <View style={{ ...styles.totalRow }}>
            <Text
              style={{
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              المبلغ المتبقي:
            </Text>
            <Text style={{ fontSize: 12 }}>
              {data?.remaining_total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>شكراً لتعاملكم معنا</Text>
          <Text>تاريخ الطباعة: {new Date().toLocaleDateString("ar-DZ")}</Text>
        </View>
      </Page>
    </Document>
  );
}
