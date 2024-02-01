import "./pictures-api";
import "./markup";
import "./styles.css";
import { getPictures, picturesCountQuery } from "./pictures-api";
import { markup } from "./markup";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from "notiflix";

export const refs = {
  form: document.querySelector("#search-form"),
  gallery: document.querySelector(".gallery"),
  target: document.querySelector(".js-guard"),
};

refs.form.addEventListener("submit", onSubmit);

let lightboxGallery = new SimpleLightbox(".gallery a", {
  captionsData: "alt",
  captionPosition: "bottom",
  captionDelay: 250,
});

let currentPage = 1;
const options = {
  root: null,
  rootMargin: "350px",
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoadMore, options);

function onSubmit(e) {
  e.preventDefault();
  observer.unobserve(refs.target);
  currentPage = 1;
  refs.gallery.innerHTML = "";

  if (refs.form.elements.searchQuery.value.trim() === "") {
    Notiflix.Notify.failure(
      "Sorry, but you must enter your search query. Please try again."
    );
    return;
  }

  getPictures(currentPage)
    .then((response) => {
      const {
        data: { hits, totalHits },
      } = response;

      if (hits.length < 1) {
        Notiflix.Notify.failure(
          "Sorry, there are no images matching your search query. Please try again."
        );
      }

      refs.gallery.insertAdjacentHTML("beforeend", markup(hits));

      if (!(hits.length < 1)) {
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      }

      lightboxGallery.refresh();

      if (!(totalHits <= picturesCountQuery)) {
        observer.observe(refs.target);
      }

      if (hits.length > 0) {
        onScroll();
      }
    })
    .catch(showError);
}

function onLoadMore(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      currentPage += 1;

      getPictures(currentPage)
        .then((response) => {
          const {
            data: { hits },
          } = response;

          refs.gallery.insertAdjacentHTML("beforeend", markup(hits));

          lightboxGallery.refresh();

          if (hits.length < picturesCountQuery) {
            observer.unobserve(refs.target);
            Notiflix.Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
          }

          if (hits.length > 0) {
            onScroll();
          }
        })
        .catch(showError);
    }
  });
}

function showError(err) {
  Notiflix.Notify.failure(`${err.name}: ${err.message}`, {
    timeout: 5000,
    width: "300px",
    fontSize: "16px",
  });
}

function onScroll() {
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}
