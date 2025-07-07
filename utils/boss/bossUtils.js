export const getBossImageUrl = (id) =>
  `https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/eventBosse/${
    id.charAt(0).toUpperCase() + id.slice(1)
  }.png`;
