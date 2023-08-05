import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayAPI } from './api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  alertError: false,
  loop: true,
});

const pixabuyApi = new PixabayAPI();

const formEl = document.querySelector('.search-form');
const galleryListEl = document.querySelector('.js-gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

formEl.addEventListener('submit', handleSearchFormSubmit);
loadMoreBtnEl.addEventListener('click', handleLoadMorePhotos);

function handleSearchFormSubmit(evt) {
  evt.preventDefault();
  galleryListEl.innerHTML = '';
  const searchQuery = evt.currentTarget.elements.searchQuery.value.trim();
  pixabuyApi.query = searchQuery;

  pixabuyApi
    .fetchPixabayPhotos()
    .then(({ data }) => {
      const cartData = data.hits;
      galleryListEl.innerHTML = createGalleryCards(cartData);
      lightbox.refresh();
      if (cartData.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        loadMoreBtnEl.classList.add('is-hidden');
      } else {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
        loadMoreBtnEl.classList.remove('is-hidden');
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function handleLoadMorePhotos() {
  pixabuyApi.page += 1;
  pixabuyApi
    .fetchPixabayPhotos()
    .then(({ data }) => {
      const cartData = data.hits;
      const countOfPages = data.total / pixabuyApi.per_page;
      galleryListEl.insertAdjacentHTML(
        'beforeend',
        createGalleryCards(cartData)
      );
      lightbox.refresh();
      if (data.totalHits > countOfPages) {
        Notify.failure(
          `We're sorry, but you've reached the end of search results.`
        );
        loadMoreBtnEl.classList.add('is-hidden');
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function createGalleryCards(arr) {
  return arr
    .map(
      ({
        likes,
        downloads,
        comments,
        views,
        webformatURL,
        tags,
        largeImageURL,
      }) => `<li class="photo-card"><a class="gallery__link" href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
            <div class="info">
              <p class="info-item">
                <b>Likes</b><span>${likes}</span>
              </p>
              <p class="info-item">
                <b>Views</b><span>${views}</span>
              </p>
              <p class="info-item">
                <b>Comments</b><span>${comments}</span>
              </p>
              <p class="info-item">
                <b>Downloads</b><span>${downloads}</span>
              </p></div></li>`
    )
    .join('');
}
