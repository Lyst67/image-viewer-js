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

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryListEl: document.querySelector('.js-gallery'),
  loadMoreBtnEl: document.querySelector('.load-more'),
};

refs.formEl.addEventListener('submit', handleSearchFormSubmit);
refs.loadMoreBtnEl.addEventListener('click', handleLoadMorePhotos);

function handleSearchFormSubmit(evt) {
  evt.preventDefault();
  refs.galleryListEl.innerHTML = '';
  pixabuyApi.page = 1;
  const searchQuery = evt.currentTarget.elements.searchQuery.value.trim();
  pixabuyApi.query = searchQuery;

  pixabuyApi
    .fetchPixabayPhotos()
    .then(({ data }) => {
      const cartData = data.hits;
      refs.galleryListEl.innerHTML = createGalleryCards(cartData);
      lightbox.refresh();
      if (cartData.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.loadMoreBtnEl.classList.add('is-hidden');
      } else {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
        refs.loadMoreBtnEl.classList.remove('is-hidden');
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
      refs.galleryListEl.insertAdjacentHTML(
        'beforeend',
        createGalleryCards(cartData)
      );
      smoothPageScrolling();
      lightbox.refresh();
      console.log(data);
      console.log(pixabuyApi.page);
      console.log(countOfPages);
      if (pixabuyApi.page > countOfPages) {
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
      }) => `<li class="photo-card"><div class="photo"><a class="gallery__link" href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
      </div>
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

function smoothPageScrolling() {
  const { height: cardHeight } =
    refs.galleryListEl.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
