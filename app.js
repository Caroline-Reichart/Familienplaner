document.addEventListener('DOMContentLoaded', () => { // Wird ausgeführt, wenn das Dokument vollständig geladen wurde
    const memberForm = document.getElementById('memberForm'); // Formular zum Hinzufügen von Familienmitgliedern
    const eventForm = document.getElementById('eventForm'); // Formular zum Hinzufügen von Ereignissen
    const eventMemberSelect = document.getElementById('eventMember'); // Dropdown-Menü zum Auswählen eines Familienmitglieds
    const memberList = document.getElementById('memberList'); // Liste der Familienmitglieder
    const eventList = document.getElementById('eventList');     // Liste der Ereignisse
    const calendarEl = document.getElementById('calendar'); // Kalender-Element

    let members = JSON.parse(localStorage.getItem('members')) || []; // Familienmitglieder aus dem lokalen Speicher laden
    let events = JSON.parse(localStorage.getItem('events')) || []; // Ereignisse aus dem lokalen Speicher laden

    // Wenn die Ereignisse nicht als Array gespeichert sind, Ereignisse in das richtige Format konvertieren
    if (!Array.isArray(events)) { 
        events = Object.values(events).flatMap(eventGroup => Object.values(eventGroup));
    } 

    console.log('Initial Events:', events); // Debugging

    const calendar = new FullCalendar.Calendar(calendarEl, { // Erstellt eine neue Instanz des FullCalendar
        //initialView: 'timeGridWeek',    // Standardansicht: Monatsansicht
        timeZone: 'MEZ',
        initialView: 'timeGridFourDay',
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'timeGridDay,timeGridFourDay'
            },
            views: {
                timeGridFourDay: {
                type: 'timeGrid',
                duration: { days: 7 },
                buttonText: 'week'
                }
            },
        events: events,                // Ereignisse anzeigen
        Boolean, default: true,         //Wenn „true“, wird die Größe des Kalenders automatisch angepasst, wenn die Größe des Fensters geändert wird, und der Rückruf „windowResize“ wird aufgerufen. Wenn „false“, wird nichts davon passieren.
        editable: true,               // Ereignisse bearbeiten
        eventClick: function(info) { // Wird aufgerufen, wenn auf ein Ereignis geklickt wird
            
            info.jsEvent.preventDefault(); // Verhindert das Standardverhalten des Browsers

            // Zeigt die Details des Ereignisses an
            alert('Ereignis: ' + info.event.title + '\n' +      // Titel anzeigen
                  'Start: ' + info.event.start.toLocaleString() + '\n' +  // Startdatum anzeigen
                  (info.event.end ? 'Ende: ' + info.event.end.toLocaleString() + '\n' : '') + // Enddatum anzeigen, wenn vorhanden
                  'Beschreibung: ' + (info.event.extendedProps.description || 'Keine Beschreibung'));  // Beschreibung anzeigen 

            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) { // Bestätigungsnachricht anzeigen
                info.event.remove();  // Ereignis entfernen
                events = events.filter(event => event.id !== info.event.id); // Ereignis aus der Liste entfernen
                localStorage.setItem('events', JSON.stringify(events)); // Ereignisse im lokalen Speicher speichern
                renderEventList(); // Ereignisliste aktualisieren
            }
        }
    });

    calendar.render(); // Kalender anzeigen

    memberForm.addEventListener('submit', (e) => { // Wird aufgerufen, wenn das Formular zum Hinzufügen von Familienmitgliedern gesendet wird
        e.preventDefault(); // Standardverhalten des Browsers verhindern

        const memberName = document.getElementById('memberName').value; // Name des Familienmitglieds aus dem Formular lesen

        if (memberName) { // Wenn ein Name eingegeben wurde
            addMember(memberName); // Familienmitglied hinzufügen
            memberForm.reset(); // Formular zurücksetzen
        }
    });

    eventForm.addEventListener('submit', (e) => { // Wird aufgerufen, wenn das Formular zum Hinzufügen von Ereignissen gesendet wird
        e.preventDefault(); // Standardverhalten des Browsers verhindern

        const eventName = document.getElementById('eventName').value;  // Name des Ereignisses aus dem Formular lesen
        const eventDate = document.getElementById('eventDate').value;   // Datum des Ereignisses aus dem Formular lesen
        const eventTime = document.getElementById('eventTime').value;  // Uhrzeit des Ereignisses aus dem Formular lesen
        const eventMember = document.getElementById('eventMember').value; // Familienmitglied aus dem Formular lesen

        console.log('Event Form Submitted:', { eventName, eventDate, eventTime, eventMember }); // Debugging

        if (eventName && eventDate && eventTime && eventMember) { // Wenn alle erforderlichen Felder ausgefüllt sind
            addEvent(eventName, eventDate, eventTime, eventMember); // Ereignis hinzufügen
            eventForm.reset(); // Formular zurücksetzen
        } else {
            console.error('Event form is missing required fields'); // Debugging
        }
    });

    function addMember(name) { // Funktion zum Hinzufügen von Familienmitgliedern
        const member = { id: Date.now(), name }; // Neues Mitglied erstellen
        members.push(member); // Mitglied zur Liste hinzufügen
        localStorage.setItem('members', JSON.stringify(members)); // Mitglieder im lokalen Speicher speichern
        renderMemberList(); // Mitgliederliste aktualisieren
        updateMemberSelect(); // Dropdown-Menü aktualisieren
    }

    function addEvent(name, date, time, member) { // Funktion zum Hinzufügen von Ereignissen
        const event = { // Neues Ereignis erstellen
            id: Date.now().toString(),  // ID des Ereignisses (als String, weil fullCalendar es so erwartet)
            title: `${name} (${member})`, // Titel des Ereignisses
            start: `${date}T${time}`,   // Startdatum und -zeit des Ereignisses
            extendedProps: { // Zusätzliche Eigenschaften des Ereignisses
                description: `Ereignis für ${member}` // Beschreibung des Ereignisses
            }
        };
        console.log('Adding event:', event); // Debugging
        events.push(event); // Ereignis zur Liste hinzufügen
        localStorage.setItem('events', JSON.stringify(events)); // Ereignisse im lokalen Speicher speichern
        calendar.addEvent(event); // Ereignis zum Kalender hinzufügen
        renderEventList(); // Ereignisliste aktualisieren
    }
    
    function renderMemberList() { // Funktion zum Anzeigen der Liste der Familienmitglieder
        memberList.innerHTML = ''; // Liste leeren
        members.forEach(member => { // Für jedes Mitglied
            const li = document.createElement('li'); // Neues Listenelement erstellen
            li.className = 'member-item'; // Klasse hinzufügen
            li.textContent = member.name; // Namen des Mitglieds hinzufügen
            li.addEventListener('click', () => {    // Klick-Event hinzufügen
                highlightMemberEvents(member.name);  // Mitglieder-Ereignisse hervorheben
                scrollToNextEvent(member.name); // Zum nächsten Ereignis scrollen
            });                                                     
            const editButton = document.createElement('button'); // Bearbeiten-Button erstellen
            editButton.textContent = 'Bearbeiten'; // Text hinzufügen
            editButton.addEventListener('click', (e) => { // Klick-Event hinzufügen
                e.stopPropagation(); // Klicken auf den Button verhindert das Auslösen des Klick-Events auf das Listenelement
                const newName = prompt('Neuen Namen eingeben:', member.name); // Neuen Namen abfragen
                if (newName) { // Wenn ein neuer Name eingegeben wurde
                    member.name = newName; // Namen aktualisieren
                    localStorage.setItem('members', JSON.stringify(members)); // Mitglieder im lokalen Speicher speichern
                    renderMemberList(); // Mitgliederliste aktualisieren
                    updateMemberSelect(); // Dropdown-Menü aktualisieren
                }
            });
            const deleteButton = document.createElement('button'); // Löschen-Button erstellen
            deleteButton.textContent = 'Löschen'; // Text hinzufügen
            deleteButton.addEventListener('click', (e) => { // Klick-Event hinzufügen
                e.stopPropagation(); // Klicken auf den Button verhindert das Auslösen des Klick-Events auf das Listenelement
                members = members.filter(m => m.id !== member.id); // Mitglied aus der Liste entfernen
                localStorage.setItem('members', JSON.stringify(members)); // Mitglieder im lokalen Speicher speichern
                renderMemberList(); // Mitgliederliste aktualisieren
                updateMemberSelect(); // Dropdown-Menü aktualisieren
            });
            //li.appendChild(editButton); // Bearbeiten-Button zum Listenelement hinzufügen
            li.appendChild(deleteButton); // Löschen-Button zum Listenelement hinzufügen
            memberList.appendChild(li); // Listenelement zur Liste hinzufügen
        });
    }

    function renderEventList() { // Funktion zum Anzeigen der Liste der Ereignisse
        eventList.innerHTML = ''; // Liste leeren
        events.forEach(event => { // Für jedes Ereignis
            const li = document.createElement('li'); // Neues Listenelement erstellen
            li.className = 'event-item'; // Klasse hinzufügen
            li.textContent = `${event.title} - ${event.start}`; // Titel und Startdatum des Ereignisses hinzufügen
            const editButton = document.createElement('button'); // Bearbeiten-Button erstellen
            editButton.textContent = 'Bearbeiten'; // Text hinzufügen
            editButton.addEventListener('click', () => { // Klick-Event hinzufügen
                const newName = prompt('Neuen Ereignisnamen eingeben:', event.title.split(' (')[0]); // Neuen Namen abfragen
                const newDate = prompt('Neues Datum eingeben (DD-MM-YYYY):', event.start.split('T')[0]); // Neues Datum abfragen
                const newTime = prompt('Neue Uhrzeit eingeben (HH:MM):', event.start.split('T')[1]); // Neue Uhrzeit abfragen
                const newMember = prompt('Neues Familienmitglied eingeben:', event.title.split(' (')[1].slice(0, -1)); // Neues Mitglied abfragen
                if (newName && newDate && newTime && newMember) { // Wenn alle Felder ausgefüllt sind
                    event.title = `${newName} (${newMember})`; // Titel aktualisieren
                    event.start = `${newDate}T${newTime}`; // Startdatum und -zeit aktualisieren
                    localStorage.setItem('events', JSON.stringify(events));     // Ereignisse im lokalen Speicher speichern
                    calendar.getEventById(event.id).remove(); // Ereignis aus dem Kalender entfernen
                    calendar.addEvent(event); // Ereignis zum Kalender hinzufügen
                    renderEventList(); // Ereignisliste aktualisieren
                }
            });
            const deleteButton = document.createElement('button'); // Löschen-Button erstellen
            deleteButton.textContent = 'Löschen'; // Text hinzufügen
            deleteButton.addEventListener('click', () => { // Klick-Event hinzufügen
                events = events.filter(e => e.id !== event.id); // Ereignis aus der Liste entfernen
                localStorage.setItem('events', JSON.stringify(events)); // Ereignisse im lokalen Speicher speichern
                calendar.getEventById(event.id).remove();   // Ereignis aus dem Kalender entfernen
                renderEventList(); // Ereignisliste aktualisieren
            });
            //li.appendChild(editButton); // Bearbeiten-Button zum Listenelement hinzufügen
            li.appendChild(deleteButton);   // Löschen-Button zum Listenelement hinzufügen
            eventList.appendChild(li); // Listenelement zur Liste hinzufügen
        });
    }

    function updateMemberSelect() { // Funktion zum Aktualisieren des Dropdown-Menüs
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>'; // Standardoption hinzufügen
        members.forEach(member => { // Für jedes Mitglied
            const option = document.createElement('option'); // Neue Option erstellen
            option.value = member.name; // Wert der Option festlegen
            option.textContent = member.name; // Text der Option festlegen
            eventMemberSelect.appendChild(option); // Option zum Dropdown-Menü hinzufügen
        }); 
    }

    function highlightMemberEvents(memberName) { // Funktion zum Hervorheben der Ereignisse eines Mitglieds
        calendar.getEvents().forEach(event => { // Für jedes Ereignis
            if (event.title.includes(`(${memberName})`)) { // Wenn das Ereignis das Mitglied enthält
                event.setProp('backgroundColor', 'yellow'); // Hintergrundfarbe ändern
                event.setProp('borderColor', 'yellow'); // Rahmenfarbe ändern
            } else { 
                event.setProp('backgroundColor', ''); // Hintergrundfarbe entfernen
                event.setProp('borderColor', ''); // Rahmenfarbe entfernen
            }
        });
    }

    function scrollToNextEvent(memberName) { // Funktion zum Scrollen zum nächsten Ereignis eines Mitglieds
        const now = new Date(); // Aktuelles Datum und Uhrzeit
        const futureEvents = events.filter(event => { // Zukünftige Ereignisse des Mitglieds
            return event.title.includes(`(${memberName})`) && new Date(event.start) >= now; // Ereignis enthält Mitglied und ist in der Zukunft
        });             

        if (futureEvents.length > 0) { // Wenn es zukünftige Ereignisse gibt
            const nextEvent = futureEvents.reduce((earliest, current) => { // Nächstes Ereignis finden
                return new Date(current.start) < new Date(earliest.start) ? current : earliest; // Früheres Ereignis auswählen
            });

            calendar.gotoDate(nextEvent.start); // Zum Startdatum des nächsten Ereignisses scrollen
        }
    }

    // Initial rendering
    renderMemberList(); // Mitgliederliste anzeigen
    renderEventList(); // Ereignisliste anzeigen
    updateMemberSelect(); // Dropdown-Menü aktualisieren
});



//funktioniert sehr gut 
/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // Ensure events are in the correct format
    if (!Array.isArray(events)) {
        events = Object.values(events).flatMap(eventGroup => Object.values(eventGroup));
    }

    console.log('Initial Events:', events); // Debugging

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const eventMember = document.getElementById('eventMember').value;

        console.log('Event Form Submitted:', { eventName, eventDate, eventTime, eventMember }); // Debugging

        if (eventName && eventDate && eventTime && eventMember) {
            addEvent(eventName, eventDate, eventTime, eventMember);
            eventForm.reset();
        } else {
            console.error('Event form is missing required fields'); // Debugging
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, time, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: `${date}T${time}`
        };
        console.log('Adding event:', event); // Debugging
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            li.addEventListener('click', () => {
                highlightMemberEvents(member.name);
                scrollToNextEvent(member.name);
            });
            const editButton = document.createElement('button');
            editButton.textContent = 'Bearbeiten';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const newName = prompt('Neuen Namen eingeben:', member.name);
                if (newName) {
                    member.name = newName;
                    localStorage.setItem('members', JSON.stringify(members));
                    renderMemberList();
                    updateMemberSelect();
                }
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const editButton = document.createElement('button');
            editButton.textContent = 'Bearbeiten';
            editButton.addEventListener('click', () => {
                const newName = prompt('Neuen Ereignisnamen eingeben:', event.title.split(' (')[0]);
                const newDate = prompt('Neues Datum eingeben (YYYY-MM-DD):', event.start.split('T')[0]);
                const newTime = prompt('Neue Uhrzeit eingeben (HH:MM):', event.start.split('T')[1]);
                const newMember = prompt('Neues Familienmitglied eingeben:', event.title.split(' (')[1].slice(0, -1));
                if (newName && newDate && newTime && newMember) {
                    event.title = `${newName} (${newMember})`;
                    event.start = `${newDate}T${newTime}`;
                    localStorage.setItem('events', JSON.stringify(events));
                    calendar.getEventById(event.id).remove();
                    calendar.addEvent(event);
                    renderEventList();
                }
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    function highlightMemberEvents(memberName) {
        calendar.getEvents().forEach(event => {
            if (event.title.includes(`(${memberName})`)) {
                event.setProp('backgroundColor', 'yellow');
                event.setProp('borderColor', 'yellow');
            } else {
                event.setProp('backgroundColor', '');
                event.setProp('borderColor', '');
            }
        });
    }

    function scrollToNextEvent(memberName) {
        const now = new Date();
        const futureEvents = events.filter(event => {
            return event.title.includes(`(${memberName})`) && new Date(event.start) >= now;
        });

        if (futureEvents.length > 0) {
            const nextEvent = futureEvents.reduce((earliest, current) => {
                return new Date(current.start) < new Date(earliest.start) ? current : earliest;
            });

            calendar.gotoDate(nextEvent.start);
        }
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
});  */



//diese Version ist die beste bisher
/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // Ensure events are in the correct format
    if (!Array.isArray(events)) {
        events = Object.values(events).flatMap(eventGroup => Object.values(eventGroup));
    }

    console.log('Initial Events:', events); // Debugging

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        console.log('Event Form Submitted:', { eventName, eventDate, eventMember }); // Debugging

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        } else {
            console.error('Event form is missing required fields'); // Debugging
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: date
        };
        console.log('Adding event:', event); // Debugging
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            li.addEventListener('click', () => {
                highlightMemberEvents(member.name);
                scrollToNextEvent(member.name);
            });
            const editButton = document.createElement('button');
            editButton.textContent = 'Bearbeiten';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const newName = prompt('Neuen Namen eingeben:', member.name);
                if (newName) {
                    member.name = newName;
                    localStorage.setItem('members', JSON.stringify(members));
                    renderMemberList();
                    updateMemberSelect();
                }
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const editButton = document.createElement('button');
            editButton.textContent = 'Bearbeiten';
            editButton.addEventListener('click', () => {
                const newName = prompt('Neuen Ereignisnamen eingeben:', event.title.split(' (')[0]);
                const newDate = prompt('Neues Datum eingeben (YYYY-MM-DD):', event.start);
                const newMember = prompt('Neues Familienmitglied eingeben:', event.title.split(' (')[1].slice(0, -1));
                if (newName && newDate && newMember) {
                    event.title = `${newName} (${newMember})`;
                    event.start = newDate;
                    localStorage.setItem('events', JSON.stringify(events));
                    calendar.getEventById(event.id).remove();
                    calendar.addEvent(event);
                    renderEventList();
                }
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    function highlightMemberEvents(memberName) {
        calendar.getEvents().forEach(event => {
            if (event.title.includes(`(${memberName})`)) {
                event.setProp('backgroundColor', 'yellow');
                event.setProp('borderColor', 'yellow');
            } else {
                event.setProp('backgroundColor', '');
                event.setProp('borderColor', '');
            }
        });
    }

    function scrollToNextEvent(memberName) {
        const now = new Date();
        const futureEvents = events.filter(event => {
            return event.title.includes(`(${memberName})`) && new Date(event.start) >= now;
        });

        if (futureEvents.length > 0) {
            const nextEvent = futureEvents.reduce((earliest, current) => {
                return new Date(current.start) < new Date(earliest.start) ? current : earliest;
            });

            calendar.gotoDate(nextEvent.start);
        }
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
});
 */

/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // Ensure events are in the correct format
    if (!Array.isArray(events)) {
        events = Object.values(events).flatMap(eventGroup => Object.values(eventGroup));
    }

    console.log('Initial Events:', events); // Debugging

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        console.log('Event Form Submitted:', { eventName, eventDate, eventMember }); // Debugging

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        } else {
            console.error('Event form is missing required fields'); // Debugging
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: date
        };
        console.log('Adding event:', event); // Debugging
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            const editButton = document.createElement('button');
            editButton.textContent = 'Bearbeiten';
            editButton.addEventListener('click', () => {
                const newName = prompt('Neuen Namen eingeben:', member.name);
                if (newName) {
                    member.name = newName;
                    localStorage.setItem('members', JSON.stringify(members));
                    renderMemberList();
                    updateMemberSelect();
                }
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const editButton = document.createElement('button');
            editButton.textContent = 'Bearbeiten';
            editButton.addEventListener('click', () => {
                const newName = prompt('Neuen Ereignisnamen eingeben:', event.title.split(' (')[0]);
                const newDate = prompt('Neues Datum eingeben (YYYY-MM-DD):', event.start);
                const newMember = prompt('Neues Familienmitglied eingeben:', event.title.split(' (')[1].slice(0, -1));
                if (newName && newDate && newMember) {
                    event.title = `${newName} (${newMember})`;
                    event.start = newDate;
                    localStorage.setItem('events', JSON.stringify(events));
                    calendar.getEventById(event.id).remove();
                    calendar.addEvent(event);
                    renderEventList();
                }
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
}); */


/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // Ensure events are in the correct format
    events = Object.values(events).flatMap(eventGroup => Object.values(eventGroup));

    console.log('Initial Events:', events); // Debugging

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        console.log('Event Form Submitted:', { eventName, eventDate, eventMember }); // Debugging

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        } else {
            console.error('Event form is missing required fields'); // Debugging
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: date
        };
        console.log('Adding event:', event); // Debugging
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            const editButton = document.createElement('button');
            editButton.textContent = 'Bearbeiten';
            editButton.addEventListener('click', () => {
                const newName = prompt('Neuen Namen eingeben:', member.name);
                if (newName) {
                    member.name = newName;
                    localStorage.setItem('members', JSON.stringify(members));
                    renderMemberList();
                    updateMemberSelect();
                }
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const editButton = document.createElement('button');
            editButton.textContent = 'Bearbeiten';
            editButton.addEventListener('click', () => {
                const newName = prompt('Neuen Ereignisnamen eingeben:', event.title.split(' (')[0]);
                const newDate = prompt('Neues Datum eingeben (YYYY-MM-DD):', event.start);
                const newMember = prompt('Neues Familienmitglied eingeben:', event.title.split(' (')[1].slice(0, -1));
                if (newName && newDate && newMember) {
                    event.title = `${newName} (${newMember})`;
                    event.start = newDate;
                    localStorage.setItem('events', JSON.stringify(events));
                    calendar.getEventById(event.id).remove();
                    calendar.addEvent(event);
                    renderEventList();
                }
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
}); */


//diese Version funktioniert
/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // Ensure events are in the correct format
    events = Object.values(events).flatMap(eventGroup => Object.values(eventGroup));

    console.log('Initial Events:', events); // Debugging

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        console.log('Event Form Submitted:', { eventName, eventDate, eventMember }); // Debugging

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        } else {
            console.error('Event form is missing required fields'); // Debugging
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: date
        };
        console.log('Adding event:', event); // Debugging
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
});
 */

/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    console.log('Initial Events:', events); // Debugging

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        console.log('Event Form Submitted:', { eventName, eventDate, eventMember }); // Debugging

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        } else {
            console.error('Event form is missing required fields'); // Debugging
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: date
        };
        console.log('Adding event:', event); // Debugging
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
});
 */


/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        console.log('Event Form Submitted:', { eventName, eventDate, eventMember }); // Debugging

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        } else {
            console.error('Event form is missing required fields'); // Debugging
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: date
        };
        console.log('Adding event:', event); // Debugging
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
}); */


/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: date
        };
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
});
 */


/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now().toString(), // Ensure the ID is a string
            title: `${name} (${member})`,
            start: date
        };
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
}); */


/* document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('memberForm');
    const eventForm = document.getElementById('eventForm');
    const eventMemberSelect = document.getElementById('eventMember');
    const memberList = document.getElementById('memberList');
    const eventList = document.getElementById('eventList');
    const calendarEl = document.getElementById('calendar');

    let members = JSON.parse(localStorage.getItem('members')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        editable: true,
        eventClick: function(info) {
            if (confirm(`Möchten Sie das Ereignis "${info.event.title}" löschen?`)) {
                info.event.remove();
                events = events.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
                renderEventList();
            }
        }
    });

    calendar.render();

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const memberName = document.getElementById('memberName').value;

        if (memberName) {
            addMember(memberName);
            memberForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventMember = document.getElementById('eventMember').value;

        if (eventName && eventDate && eventMember) {
            addEvent(eventName, eventDate, eventMember);
            eventForm.reset();
        }
    });

    function addMember(name) {
        const member = { id: Date.now(), name };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        renderMemberList();
        updateMemberSelect();
    }

    function addEvent(name, date, member) {
        const event = {
            id: Date.now(),
            title: `${name} (${member})`,
            start: date
        };
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent(event);
        renderEventList();
    }

    function renderMemberList() {
        memberList.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.textContent = member.name;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                members = members.filter(m => m.id !== member.id);
                localStorage.setItem('members', JSON.stringify(members));
                renderMemberList();
                updateMemberSelect();
            });
            li.appendChild(deleteButton);
            memberList.appendChild(li);
        });
    }

    function renderEventList() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.title} - ${event.start}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.addEventListener('click', () => {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('events', JSON.stringify(events));
                calendar.getEventById(event.id).remove();
                renderEventList();
            });
            li.appendChild(deleteButton);
            eventList.appendChild(li);
        });
    }

    function updateMemberSelect() {
        eventMemberSelect.innerHTML = '<option value="" disabled selected>Familienmitglied auswählen</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            eventMemberSelect.appendChild(option);
        });
    }

    // Initial rendering
    renderMemberList();
    renderEventList();
    updateMemberSelect();
});
 */

/* document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('eventForm');
    const eventList = document.getElementById('eventList');

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;

        if (eventName && eventDate) {
            addEvent(eventName, eventDate);
            eventForm.reset();
        }
    });

    function addEvent(name, date) {
        const li = document.createElement('li');
        li.className = 'event';
        li.textContent = `${name} - ${date}`;
        eventList.appendChild(li);
    }
}); */