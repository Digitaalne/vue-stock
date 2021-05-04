let favourites = [];
if (localStorage.getItem("favourites")) {
  favourites = JSON.parse(localStorage.getItem("favourites"));
}
export default {
  toggleFav(newFav) {
    if (!newFav) {
      return;
    }
    if (this.isFav(newFav)) {
      const indx = favourites.indexOf(newFav);
      this.removeFav(indx);
    } else {
      this.addFav(newFav);
    }
  },
  addFav(newFav) {
    if (!newFav) {
      return;
    }
    favourites.push(newFav);
    this.saveFav();
  },
  removeFav(x) {
    favourites.splice(x, 1);
    this.saveFav();
  },
  saveFav() {
    const json = JSON.stringify(favourites);
    localStorage.setItem("favourites", json);
  },
  isFav(fav) {
    return favourites.includes(fav);
  },
  getFavs() {
    if (localStorage.getItem("favourites")) {
      favourites = JSON.parse(localStorage.getItem("favourites"));
    }
    return favourites;
  }
};
