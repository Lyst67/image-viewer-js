import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import { PixabayAPI } from './api';

const pixabuyApi = new PixabayAPI();

const formEl = document.querySelector('.search-form');
const galleryListEl = document.querySelector('.js-gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

formEl.addEventListener('submit', handleSearchFormSubmit);
loadMoreBtnEl.addEventListener('click', handleLoadMorePhotos);

function handleSearchFormSubmit(evt) {
  evt.preventDefault();
  const searchQuery = evt.currentTarget.elements.searchQuery.value.trim();
  pixabuyApi.query = searchQuery;
  pixabuyApi
    .fetchPixabayPhotos()
    .then(({ data }) => {
      console.log(data);
      const cartData = data.hits;
      galleryListEl.innerHTML = createGalleryCards(cartData);
    })
    .catch(err => {
      console.log(err);
    });
}

function handleLoadMorePhotos() {
  pixabuyApi.page += 1;
  console.log(pixabuyApi.page);
  pixabuyApi
    .fetchPixabayPhotos()
    .then(({ data }) => {
      const cartData = data.hits;
      console.log(data);
      console.log(cartData.length);
      if (cartData.length < data.total) {
        loadMoreBtnEl.classList.add('is-hidden');
      }

      galleryListEl.insertAdjacentHTML(
        'beforeend',
        createGalleryCards(cartData)
      );
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
      }) => `<img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Likes</b>${likes}
              </p>
              <p class="info-item">
                <b>Views</b>${views}
              </p>
              <p class="info-item">
                <b>Comments</b>${comments}
              </p>
              <p class="info-item">
                <b>Downloads</b>${downloads}
              </p>`
    )
    .join('');
}
