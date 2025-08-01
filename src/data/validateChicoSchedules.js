const fs = require('fs');

const raw = fs.readFileSync('./ChicoclassDetails.json', 'utf-8');

const classes = JSON.parse(raw);

classes.forEach((cls, idx) => {
  if (!cls.hasOwnProperty('schedule')) {
    console.log(`Class #${idx} (${cls.className}) missing schedule field.`);
  } else if (!Array.isArray(cls.schedule) && !(typeof cls.schedule === 'string')) {
    console.log(`Class #${idx} (${cls.className}) has INVALID schedule (not array or string):`, cls.schedule);
  } else if (Array.isArray(cls.schedule)) {
    // Optional: Check for non-string entries inside schedule array:
    cls.schedule.forEach((entry, i) => {
      if (typeof entry !== 'string') {
        console.log(`Class #${idx} (${cls.className}) schedule[${i}] not string:`, entry);
      }
    });
  }
});
