const axios = require("axios");
import { refs } from ".";

export const picturesCountQuery = 40;

export async function getPictures(page = 1) {
  const query = refs.form.elements.searchQuery.value.trim();
  const API_KEY = "42027897-ca60981f5971518ff8fefcb8b";
  const BASE_URL = "https://pixabay.com/api/";
  const params = new URLSearchParams({
    key: API_KEY,
    q: `${query}`,
    image_type: "photo",
    orientation: "horizontal",
    safesearcg: true,
    page: page,
    per_page: `${picturesCountQuery}`,
  });

  const response = await axios.get(`${BASE_URL}?${params}`);

  return response;
}
