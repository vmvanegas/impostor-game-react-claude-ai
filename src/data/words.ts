export interface WordPair {
  word: string;
  impostorWord: string;
  category: string;
}

export const wordPairs: WordPair[] = [
  // Comida
  { word: "Pizza", impostorWord: "Hamburguesa", category: "Comida" },
  { word: "Sushi", impostorWord: "Ramen", category: "Comida" },
  { word: "Tacos", impostorWord: "Burritos", category: "Comida" },
  { word: "Helado", impostorWord: "Sorbete", category: "Comida" },
  { word: "Paella", impostorWord: "Risotto", category: "Comida" },
  { word: "Chocolate", impostorWord: "Caramelo", category: "Comida" },
  { word: "Ensalada", impostorWord: "Gazpacho", category: "Comida" },
  { word: "Croissant", impostorWord: "Donut", category: "Comida" },

  // Deportes
  { word: "Fútbol", impostorWord: "Rugby", category: "Deportes" },
  { word: "Tenis", impostorWord: "Bádminton", category: "Deportes" },
  { word: "Baloncesto", impostorWord: "Voleibol", category: "Deportes" },
  { word: "Natación", impostorWord: "Waterpolo", category: "Deportes" },
  { word: "Ciclismo", impostorWord: "Triatlón", category: "Deportes" },
  { word: "Boxeo", impostorWord: "Kickboxing", category: "Deportes" },

  // Animales
  { word: "León", impostorWord: "Tigre", category: "Animales" },
  { word: "Delfín", impostorWord: "Orca", category: "Animales" },
  { word: "Águila", impostorWord: "Halcón", category: "Animales" },
  { word: "Elefante", impostorWord: "Hipopótamo", category: "Animales" },
  { word: "Pingüino", impostorWord: "Foca", category: "Animales" },
  { word: "Cocodrilo", impostorWord: "Caimán", category: "Animales" },

  // Lugares
  { word: "París", impostorWord: "Roma", category: "Lugares" },
  { word: "Playa", impostorWord: "Piscina", category: "Lugares" },
  { word: "Biblioteca", impostorWord: "Librería", category: "Lugares" },
  { word: "Hospital", impostorWord: "Clínica", category: "Lugares" },
  { word: "Aeropuerto", impostorWord: "Estación de tren", category: "Lugares" },
  { word: "Montaña", impostorWord: "Volcán", category: "Lugares" },

  // Películas / Entretenimiento
  { word: "Harry Potter", impostorWord: "El señor de los anillos", category: "Entretenimiento" },
  { word: "Star Wars", impostorWord: "Star Trek", category: "Entretenimiento" },
  { word: "Titanic", impostorWord: "El Hundimiento", category: "Entretenimiento" },
  { word: "Netflix", impostorWord: "HBO", category: "Entretenimiento" },

  // Objetos
  { word: "Guitarra", impostorWord: "Bajo", category: "Objetos" },
  { word: "Telescopio", impostorWord: "Microscopio", category: "Objetos" },
  { word: "Bicicleta", impostorWord: "Patinete", category: "Objetos" },
  { word: "Sofá", impostorWord: "Sillón", category: "Objetos" },
  { word: "Paraguas", impostorWord: "Chubasquero", category: "Objetos" },
  { word: "Reloj", impostorWord: "Cronómetro", category: "Objetos" },
];

export function getRandomWordPair(): WordPair {
  return wordPairs[Math.floor(Math.random() * wordPairs.length)];
}
