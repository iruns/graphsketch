import firebase from "firebase";

const config = {
    apiKey: "AIzaSyAzXp1-2WG3FWLiPr_TuD4GbeIu8Cu0RXs",
    authDomain: "graphsketch-31bb2.firebaseapp.com",
    databaseURL: "https://graphsketch-31bb2.firebaseio.com",
    projectId: "graphsketch-31bb2",
    storageBucket: "graphsketch-31bb2.appspot.com",
    messagingSenderId: "923321855938"
};

firebase.initializeApp(config);

export default {
    database: firebase.database()
}
