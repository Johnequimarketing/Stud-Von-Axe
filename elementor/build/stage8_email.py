"""De twee e-mailontwerpen van stage 8.

Elementor's formulier stuurt HTML-mail. Wat het standaard stuurt is een lijst
veldnamen op een witte pagina; dit zijn twee opgemaakte berichten in de kleuren
van de site. Ze zijn met tabellen en inline stijl gebouwd en niet met flexbox,
want Outlook rendert met Word en Word kent geen flexbox.

`[all-fields]` is Elementor's eigen sjabloontag: het formulier vult daar de
ingevulde velden in. De rest is vaste tekst.
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib_axe import stage_folder, NAVY, DARK, GOUD, BG, INK, INK_SOFT, WIT, CONTACT

WORTEL = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UIT = os.path.join(WORTEL, "wordpress-elementor", stage_folder("stage-8-contact"), "templates")


def romp(titel, onderkop, lijf, voet):
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{titel}</title></head>
<body style="margin:0;padding:0;background:{BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:{BG};padding:28px 12px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;
                font-family:'Manrope',Helvetica,Arial,sans-serif;">
   <tr><td style="background:{DARK};padding:26px 28px;">
     <p style="margin:0;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;
               color:{GOUD};font-weight:700;">Stud Von Axe</p>
     <p style="margin:8px 0 0;font-size:24px;line-height:1.2;color:{WIT};
               font-family:Georgia,'Times New Roman',serif;">{titel}</p>
     <p style="margin:8px 0 0;font-size:14px;line-height:1.5;
               color:rgba(238,241,245,.72);">{onderkop}</p>
   </td></tr>
   <tr><td style="padding:26px 28px;color:{INK};font-size:15px;line-height:1.65;">
{lijf}
   </td></tr>
   <tr><td style="padding:18px 28px 26px;border-top:1px solid rgba(20,32,46,.12);
                  color:{INK_SOFT};font-size:12px;line-height:1.6;">
{voet}
   </td></tr>
  </table>
 </td></tr>
</table>
</body></html>
"""


AAN_KLANT = romp(
    "A new enquiry",
    "Someone filled in the form on studvonaxe.com.",
    f"""     <p style="margin:0 0 14px;">This came in through the website. Reply to this
       message and it goes straight back to them.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#f1ebe0;border-radius:12px;padding:16px 18px;">
      <tr><td style="font-size:14px;line-height:1.7;color:{INK};">
       [all-fields]
      </td></tr>
     </table>
     <p style="margin:18px 0 0;font-size:13px;color:{INK_SOFT};">
       Sent from <a href="https://studvonaxe.com" style="color:{GOUD};">studvonaxe.com</a>
       at [time] on [date].</p>""",
    f"""     <p style="margin:0;">{CONTACT['bedrijf']} &middot; {CONTACT['adres']}<br>
       P. IVA {CONTACT['btw']}</p>""")


AAN_AFZENDER = romp(
    "Thank you for writing",
    "We have your message and one of us will answer.",
    f"""     <p style="margin:0 0 14px;">Thank you for getting in touch with Stud Von Axe.
       Elisabetta and Adriano read everything that comes in themselves, and one of
       them will answer you. There is nobody in between.</p>
     <p style="margin:0 0 14px;">This is what you sent us:</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#f1ebe0;border-radius:12px;padding:16px 18px;">
      <tr><td style="font-size:14px;line-height:1.7;color:{INK};">
       [all-fields]
      </td></tr>
     </table>
     <p style="margin:18px 0 0;">If it is urgent, WhatsApp is the fastest way to reach
       us: <a href="https://wa.me/393495918565" style="color:{GOUD};">+39 349 591 8565</a>.</p>
     <p style="margin:14px 0 0;">We answer in Italian, English, French and German.</p>
     <p style="margin:22px 0 0;">
      <a href="https://studvonaxe.com/foals/"
         style="display:inline-block;background:{GOUD};color:{DARK};text-decoration:none;
                font-weight:700;font-size:12.5px;letter-spacing:1.25px;padding:12px 20px;
                border-radius:999px;">SEE THE FOALS</a></p>""",
    f"""     <p style="margin:0;">{CONTACT['bedrijf']} &middot; {CONTACT['adres']}<br>
       P. IVA {CONTACT['btw']} &middot;
       <a href="https://studvonaxe.com/privacy/" style="color:{INK_SOFT};">Privacy policy</a></p>
     <p style="margin:8px 0 0;">You are receiving this because you filled in a form on
       our website. We do not add anyone to a mailing list.</p>""")


if __name__ == "__main__":
    os.makedirs(UIT, exist_ok=True)
    for naam, tekst in (("email-to-client.html", AAN_KLANT),
                        ("email-to-sender.html", AAN_AFZENDER)):
        with open(os.path.join(UIT, naam), "w", encoding="utf-8") as f:
            f.write(tekst)
        print(f"  {naam}   {len(tekst)} tekens")
