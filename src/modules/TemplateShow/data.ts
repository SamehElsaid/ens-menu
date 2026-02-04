import { BiCoffee, BiUser } from "react-icons/bi";
import { FaMoneyBillWave } from "react-icons/fa";
import { HiOutlineChartBar } from "react-icons/hi";
import { Template } from "@/types/types";

export const templates: Template[] = [
  {
    id: 0,
    titleAr: "أنشئ المنيو الخاص بك في دقائق",
    titleEn: "Create your menu in minutes",
    labelAr: "سهولة وتحكم",
    labelEn: "Easy and Control",
    icon: BiCoffee,
    textAr:
      "أنشئ منيو إلكتروني احترافي لمطعمك أو كافيهك خلال دقائق بدون أي تعقيد لوحة تحكم بسيطة تتيح لك إضافة الأصناف والصور والأسعار بكل سهولة تحكم كامل في المنيو وحدّثه في أي وقت ليكون جاهزًا دائمًا لعملائك",
    textEn:
      "Create a professional electronic menu for your restaurant or cafe in minutes without any complexity. A simple control panel that allows you to add items, images, and prices easily. Full control over the menu and update it anytime to be always ready for your customers.",
    image: "/images/temp/1sst.jpg",
    textAltAr: "يزيد المبيعات ويُحسن تجربة العملاء",
    textAltEn: "Increases sales and improves customer experience",
  },
  {
    id: 1,
    titleAr: "تحكم كامل واحصائيات متكاملة ",
    titleEn: "Full control and integrated statistics",
    labelAr: "بسهولة وترتيب",
    labelEn: "Easy and Order",
    icon: BiUser,
    textAr:
      "تحكم كامل وسهل في إضافة القوائم وتعديلها من لوحة تحكم بسيطة ومرنة تتيح لك إدارة كل تفاصيل المنيو بسهولة ومشاهدة إحصائيات كاملة تساعدك على فهم أداء الأصناف وتحسين قراراتك لزيادة المبيعات وتطوير عملك",
    textEn:
      "Full control and easy to add and edit menus from a simple and flexible control panel that allows you to manage all details of the menu easily and view complete statistics that help you understand the performance of the items and improve your decisions to increase sales and develop your business",
    image: "/images/temp/2nd.jpg",
    textAltAr: "لا يحتاج اى خبرة تقنية",
    textAltEn: "No technical experience required",
  },

  {
    id: 2,
    titleAr: "تحكم كامل في التصنيفات",
    titleEn: "Full Control in Categories",
    labelAr: "إدارة ذكية لقوائم مطعمك ",
    labelEn: "Smart management of your restaurant menu",
    icon: HiOutlineChartBar,
    textAr:
      "رتّب الأصناف داخل كل تصنيف، وعدّل الأسماء والترتيب في أي وقت ليظهر المنيو بشكل منظم واحترافي أمام عملائك",
    textEn:
      "Sort items within each category, edit names and order anytime to display the menu in a professional and organized way in front of your customers",
    image: "/images/temp/4rd.jpg",
    textAltAr: "أضف المنتجات بسهولة",
    textAltEn: "Add products easily",
  },
  {
    id: 3,
    titleAr: "تحكم كامل في الأسعار",
    titleEn: "Full Control in Prices",
    labelAr: "تحكم كامل في كل منتج",
    labelEn: "Full control of all products",
    icon: FaMoneyBillWave,
    textAr:
      "أضف منتجات جديدة بسرعة وسهولة من لوحة التحكم، وحدد صورها وأسعارها ووصفها بدون أي تعقيد. يمكنك تفعيل أو تعطيل أي منتج في أي وقت ليظهر فقط ما ترغب بعرضه لعملائك، مع تحديث المنيو فورًا ليكون جاهزًا دائمًا لعملائك",
    textEn:
      "Add new products quickly and easily from the control panel, select their images, prices and descriptions without any complexity. You can enable or disable any product at any time to display only what you want to display to your customers, with the menu updated instantly to be always ready for your customers",
    image: "/images/temp/4rd.jpg",
    textAltAr: "تمنحك مرونة كاملة للتحكم في المنيو",
    textAltEn: "Full control of the menu",
  },
];
