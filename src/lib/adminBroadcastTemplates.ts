export type BroadcastTemplateAudience = "products-no-image";
export type BroadcastEmailLocale = "ar" | "en";

type BroadcastTemplate = { subject: string; message: string };

const PRODUCTS_NO_IMAGE_TEMPLATES: Record<
  BroadcastEmailLocale,
  BroadcastTemplate
> = {
  ar: {
    subject: "أضف صوراً لمنتجاتك في ensmenu",
    message: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ensmenu</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Tahoma,Arial,sans-serif;color:#334155;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="padding:28px 24px;text-align:right;">
<h1 style="margin:0 0 16px;font-size:22px;color:#1a0b2e;">مرحباً {{name}}،</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.75;">لاحظنا أن بعض المنتجات في منيو مطعمك لا تحتوي على صور.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.75;">إضافة صور للمنتجات يجعل المنيو أكثر جاذبية ويساعد عملاءك على الاختيار بثقة.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.75;">يمكنك إضافة الصور بسهولة من لوحة التحكم ← <strong>المنتجات</strong>.</p>
<p style="margin:0;font-size:15px;line-height:1.75;">مع تحياتنا،<br />فريق ensmenu</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  },
  en: {
    subject: "Add images to your menu items on ensmenu",
    message: `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ensmenu</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#334155;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="padding:28px 24px;text-align:left;">
<h1 style="margin:0 0 16px;font-size:22px;color:#1a0b2e;">Hello {{name}},</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.75;">We noticed that some items in your menu don't have photos yet.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.75;">Adding images makes your menu more appealing and helps customers choose with confidence.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.75;">You can add photos easily from your dashboard → <strong>Products</strong>.</p>
<p style="margin:0;font-size:15px;line-height:1.75;">Best regards,<br />The ensmenu team</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  },
};

const TEMPLATES: Record<
  BroadcastTemplateAudience,
  Record<BroadcastEmailLocale, BroadcastTemplate>
> = {
  "products-no-image": PRODUCTS_NO_IMAGE_TEMPLATES,
};

export function getBroadcastTemplate(
  audience: BroadcastTemplateAudience,
  emailLocale: BroadcastEmailLocale,
): BroadcastTemplate {
  return TEMPLATES[audience][emailLocale];
}

export function hasBroadcastTemplate(
  audience: string,
): audience is BroadcastTemplateAudience {
  return audience === "products-no-image";
}
