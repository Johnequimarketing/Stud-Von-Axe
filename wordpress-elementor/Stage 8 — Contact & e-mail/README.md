# Stage 8: Contact page, the forms and the e-mails

Build the contact page and give the site a real form for the first time, with proper e-mails to the client and to us.

**Planned:** Thu 24 Sep to Fri 25 Sep 2026

## Steps

1. Pages → Add New → **Contact us** → import `contact.json`.
2. Set up the Elementor Form: two actions, **Email** to the client and **Email 2** to us.
3. Install and configure an SMTP plugin. Without it WordPress sends through the host's mail and half of it lands in spam.
4. Import the two e-mail designs from `email-to-client.html` and `email-to-sender.html`.
5. Send a test from the contact form and from a horse page, and check that both arrive.
6. Check the enquiry form on a horse page: it must carry the horse's name in the subject line by itself.

## Worth knowing

- **Today neither form actually sends anything.** Both open the visitor's mail app with a prepared message to studvonaxe@gmail.com. That was a deliberate choice on the static site because there was no back end. This stage is where it becomes a real form.
- **Two things must be settled before this stage starts:** which address receives the mail (studvonaxe@gmail.com or an address on the domain), and which SMTP account we send through. Both are questions for the client, not decisions to make in the builder.
- There is no Google Maps block on the contact page and it must not come back. The client asked for it to be removed: the office is in Castelnuovo Garfagnana, the stable is not.
- The company details are: Stud Von Axe SRL, Via per Arni, 55032 Castelnuovo Garfagnana (LU), Italy. **No house number** — that is correct, not missing. The VAT number IT02519980466 still has to be confirmed against the new SRL name.
- The enquiry form is on 106 horse pages. It is part of the single templates from stages 3 to 7, so building it here means going back into those five templates once. That is on purpose: the form design should be settled before it is copied five times.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `contact.json`
- `email-to-client.html`
- `email-to-sender.html`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app/contact/ (Contact)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1acushDTrBnUJfkUsoRkYFoTaNiII-Tr7

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `hero-contact.jpg` | — | design image |

1 files.

