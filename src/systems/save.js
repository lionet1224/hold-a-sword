const SAVE_KEY = 'hold_a_sword_save';

export function saveGame(player) {
  try {
    const data = JSON.stringify(player.toJSON());
    localStorage.setItem(SAVE_KEY, data);
    return true;
  } catch (e) {
    return false;
  }
}

export function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}
