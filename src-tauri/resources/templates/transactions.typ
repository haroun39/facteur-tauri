#set page(width: 210mm, height: 297mm)

#set text(font: "IBM Plex Sans Hebrew")
#set table(
  stroke: none,
  gutter: 0.05em,
  fill: (x, y) => if y == 0 { rgb(239, 240, 243) },
)

#let name = "{name}"
#let phone = "{phone}"
#let address = "{address}"
#let fromDate = "{from_date}"
#let toDate = "{to_date}"
#let total_invoices = "{total_invoices}"
#let total_payments = "{total_payments}"
#let remaining_total = "{remaining_total}"
#let rows = (
  { rows }
)

#let header(company, phone, address) = block[
  #align(end)[
    #text(size: 10pt)[الهاتف: #phone] \
    #text(size: 10pt)[العنوان: #address] \
    #line(length: 100%, stroke: 0.5pt + rgb(231, 227, 228))
  ]
]

#let invoices-table(rows) = table(
  columns: (1fr, 1fr, 1fr, 1fr),
  align: (right, right, right, right, right),
  stroke: (x, y) => if y == 0 {
    rgb(231, 227, 228)
  } else {
    rgb(231, 227, 228)
  },
  inset: 10pt,
  table.header([المبلغ], [نوع المعاملة], [التاريخ], []),

  ..rows.flatten(),
)

#let footer() = block[
  #line(length: 100%)
  #align(center)[شكراً لتعاملكم معنا] \
  #align(center)[تاريخ الطباعة: #datetime.today().display("[day]/[month]/[year]")]
]

#align(center)[
  #block(inset: 10pt)[= تقرير المعاملات]
  #box(height: 2mm)
]

#grid(
  columns: (1fr, 1fr),
  rows: 28mm,
  gutter: 50pt,
  box()[
    #align(end)[
      تفاصيل التقرير
    ]
    #line(
      length: 100%,
      stroke: 0.5pt + rgb(231, 227, 228),
    )
    #align(end)[
      #text(size: 10pt)[
        التاريخ: #fromDate إلى #toDate
      ] \
      #text(size: 10pt)[] \
      #text(size: 10pt)[] \
    ]
  ],
  box()[
    #align(end)[
      معلومات العميل
    ]
    #line(
      length: 100%,
      stroke: 0.5pt + rgb(231, 227, 228),
    )
    #align(end)[

      #text(size: 10pt)[الاسم: #name] \
      #text(size: 10pt)[الهاتف: #phone] \
      #text(size: 10pt)[العنوان: #address] \

    ]
  ],
)

#line(length: 100%, stroke: 0.5pt + rgb(231, 227, 228))

#invoices-table(rows)

#block(
  inset: 5pt,
  width: 80mm,
)[
  مجموع الفواتير : #h(1fr) #total_invoices
  #line(
    length: 100%,
    stroke: 0.5pt + rgb(231, 227, 228),
  )
]

#block(
  inset: 5pt,
  width: 80mm,
)[
  مجموع المدفوعات : #h(1fr) #total_payments
  #line(
    length: 100%,
    stroke: 0.5pt + rgb(231, 227, 228),
  )
]

#block(
  inset: 5pt,
  width: 80mm,
)[
  المبلغ المتبقي: #h(1fr) #remaining_total
  #line(
    length: 100%,
    stroke: 0.5pt + rgb(231, 227, 228),
  )
]


#footer()
