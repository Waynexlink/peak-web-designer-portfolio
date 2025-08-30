module.exports = {
  name: "Williams Anetor",
  email: "wm500972@gmail.com",
  phoneForTel: "091-653-5457",
  phoneFormatted: "(234) 9165-345457",
  address: {
    lineOne: "First Address Line",
    lineTwo: "Second Address Line",
    city: "Abuja",
    state: "FCT",
    zip: "901101",
    country: "Nigeria",
    mapLink: "",
  },
  socials: {
    facebook: "",
    instagram: "",
  },
  //! Make sure you include the file protocol (e.g. https://) and that NO TRAILING SLASH is included
  domain: "https://peakwebdesigner.netlify.app",
  url: "http://localhost:8080",
  // Passing the isProduction variable for use in HTML templates
  isProduction: process.env.ELEVENTY_ENV === "PROD",
};
