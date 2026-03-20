# Role: Senior Full-Stack Engineer & Software Architect
# Context: Refactoring "Opale Studio" - Booking System for a Photo Studio
# SKILL: UTILIZZA SKILL Frontend-design E senior-backend
# CI SONO dei limiti tecnici, però se li gestisci installi tu tutto posso anche pensare di utilizzare un altro bakcend non quello speicifcato
# questi sono i piani, però puoi deciderea anche di aggiungere cose più ottimali per raggiungere l'obiettivo. Unico limite non posso ancora utilizzare cose a pagamento
# come server smtp per l'invio di email o boh altro

Agisci come un Senior Full-Stack Developer esperto in AdonisJS 6 (Backend) e React (Frontend). 
Il tuo compito è eseguire il refactoring completo di "Opale Studio", un'applicazione per la gestione delle prenotazioni di una sala pose. Il progetto attuale è strutturalmente carente e richiede una nuova architettura scalabile e professionale.

## 1. Obiettivi Architetturali (Database & Backend)
Il database attuale (gestito su DBeaver) deve essere ricostruito. Elimina tabelle ridondanti e ottimizza la persistenza.
- **Tecnologie:** AdonisJS 6, Lucid ORM, PostgreSQL/MySQL (via DBeaver).
- **Schema Database Richiesto:**
    - `users`: (id, email, password, full_name, role [admin/client], google_id, avatar).
    - `bookings`: (id, user_id, start_time, end_time, status, total_price, notes).
    - `services`: (id, name, description, price, is_extra).
    - `booking_services`: (Pivot table per collegare extra a specifiche prenotazioni).

## 2. Requisiti Funzionali

### Autenticazione & Sicurezza
- Implementa **Adonis Ally** per l'autenticazione Google (correggi i flussi di callback e persistenza sessione).
- Registrazione standard con **indicatore di sicurezza password** (Zxcvbn o logica custom) nel frontend.
- Gestione della persistenza del login (sessioni o Opaque Tokens).

### User Features (Mobile First)
- **Calendario Interattivo:** L'utente vede i propri slot (modificabili/eliminabili) e visualizza come "Occupato" gli slot di altri utenti (senza vederne i dettagli).
- **Booking Flow:** Selezione data/ora -> Visualizzazione Gallery Sala -> Selezione Servizi Extra (creati dall'admin) -> Riepilogo -> Invio Email di conferma automatica.
- **UI/UX:** Design "Opale" (colori eleganti, minimalisti). Layout fluido: Mobile-first con adattamento responsive per Desktop.

### Admin Features
- Dashboard per vedere **tutte** le prenotazioni con i dettagli degli utenti.
- CRUD completo per i servizi extra e gestione prezzi.
- Potere di cancellazione su qualsiasi prenotazione.

## 3. dati tecnici
- **Frontend:** React con Tailwind CSS per lo styling.
- **Validazione:** Utilizza le "VineJS" validation di Adonis 6.
- **Email:** Configura un Mailer (SMTP o Resend) per l'invio delle conferme di prenotazione.
- **Output richiesto:** Fornisci la struttura delle Migrations, i Controller principali per la logica di prenotazione e i componenti React chiave per il Calendario e il Form Extra.

## 4. Cosa Evitare
- Non utilizzare architetture a tabella singola per utenti e prenotazioni.
- Evita di gestire lo stato del calendario solo lato client; la verità deve risiedere nel database per evitare overbooking.
- Non trascurare i Middleware di autenticazione per le rotte Admin.

---
**Istruzione operativa:** Inizia proponendo lo schema delle migrazioni di AdonisJS 6 e la struttura delle API per la gestione della disponibilità del calendario.