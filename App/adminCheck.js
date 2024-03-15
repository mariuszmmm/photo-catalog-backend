const User = require('./models/User');
const bcrypt = require('bcryptjs');

function adminCheck() {
  User.findOne({ isAdmin: true }).then(admin => {
    if (!admin) {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Błąd hashowania hasła:', err);
          return;
        }

        const newAdmin = new User({
          username: adminUsername,
          password: hashedPassword,
          isAdmin: true
        });

        newAdmin.save().then(() => {
          console.log('Tworzenie konta administratora');
        }).catch(err => {
          console.error('Błąd podczas tworzenia konta administratora:', err);
        });
      });
    }
  });
}

module.exports = adminCheck;