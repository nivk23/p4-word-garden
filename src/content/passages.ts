import type { Level } from "./levels";

export interface Passage {
  id: string;
  /** Primary level that can read this passage, from the words it uses. */
  level: Level;
  text: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  targetWords: string[];
}

export const passages: Passage[] = [
  {
    id: "passage_1",
    level: 1,
    text: "Tom has a huge dog. The dog is very big and happy. Tom loves his dog very much.",
    questions: [
      {
        question: "How big is Tom's dog?",
        options: ["very small", "huge", "tiny"],
        correctAnswer: 1,
      },
      {
        question: "Does Tom like his dog?",
        options: ["yes", "no", "maybe"],
        correctAnswer: 0,
      },
    ],
    targetWords: ["huge"],
  },
  {
    id: "passage_2",
    level: 2,
    text: "A tiny ant walks on the ground. The ant is so small you can barely see it. It carries a big leaf home.",
    questions: [
      {
        question: "What size is the ant?",
        options: ["big", "huge", "tiny"],
        correctAnswer: 2,
      },
      {
        question: "What does the ant carry?",
        options: ["a stick", "a leaf", "food"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["tiny"],
  },
  {
    id: "passage_3",
    level: 3,
    text: "Ali shouted 'Goal!' when his team scored. Everyone shouted with him. It was very loud and exciting.",
    questions: [
      {
        question: "Why did Ali shout?",
        options: ["he was angry", "his team scored", "he was sad"],
        correctAnswer: 1,
      },
      {
        question: "Was it loud?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["shout"],
  },
  {
    id: "passage_4",
    level: 4,
    text: "The baby sleeps in the quiet room. Her mother whispers a soft song. The whispered voice makes the baby smile.",
    questions: [
      {
        question: "Who whispers?",
        options: ["the baby", "the mother", "a friend"],
        correctAnswer: 1,
      },
      {
        question: "How is the mother's voice?",
        options: ["loud", "soft", "angry"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["whisper"],
  },
  {
    id: "passage_5",
    level: 4,
    text: "A gentle nurse helps the sick boy. She speaks soft and kind words. The boy feels safe with her.",
    questions: [
      {
        question: "What kind of person is the nurse?",
        options: ["loud", "mean", "gentle"],
        correctAnswer: 2,
      },
      {
        question: "Does the boy feel safe?",
        options: ["yes", "no", "not sure"],
        correctAnswer: 0,
      },
    ],
    targetWords: ["gentle"],
  },
  {
    id: "passage_6",
    level: 1,
    text: "The brave girl jumps in the cold pool. She was scared at first, but she was brave. All her friends cheer for her.",
    questions: [
      {
        question: "Was the girl brave?",
        options: ["no", "yes", "not at all"],
        correctAnswer: 1,
      },
      {
        question: "What was the water like?",
        options: ["hot", "warm", "cold"],
        correctAnswer: 2,
      },
    ],
    targetWords: ["brave"],
  },
  {
    id: "passage_7",
    level: 4,
    text: "Sam loves to collect stamps from many countries. She has stamps from Japan, Korea, and Singapore. Her collection is very big.",
    questions: [
      {
        question: "What does Sam collect?",
        options: ["books", "stamps", "toys"],
        correctAnswer: 1,
      },
      {
        question: "From how many countries does she have stamps?",
        options: ["two", "three", "one"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["collect"],
  },
  {
    id: "passage_8",
    level: 5,
    text: "The bicycle was broken. Dad worked hard to repair it. After two hours, the bicycle was like new again.",
    questions: [
      {
        question: "What does Dad repair?",
        options: ["a car", "a bicycle", "a house"],
        correctAnswer: 1,
      },
      {
        question: "Is the bicycle good now?",
        options: ["yes", "no", "still broken"],
        correctAnswer: 0,
      },
    ],
    targetWords: ["repair"],
  },
  {
    id: "passage_9",
    level: 4,
    text: "The school postponed the sports day because of the rain. They said it would happen next week. Everyone will come back then.",
    questions: [
      {
        question: "Why was the sports day postponed?",
        options: ["it was hot", "it was raining", "it was cold"],
        correctAnswer: 1,
      },
      {
        question: "When will the sports day happen?",
        options: ["today", "next week", "next month"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["postpone"],
  },
  {
    id: "passage_10",
    level: 4,
    text: "The teacher advised the children to study hard. He said, 'Hard work brings success.' The children listened to his advice.",
    questions: [
      {
        question: "What did the teacher advise?",
        options: ["play games", "study hard", "go home"],
        correctAnswer: 1,
      },
      {
        question: "Did the children listen?",
        options: ["yes", "no", "maybe"],
        correctAnswer: 0,
      },
    ],
    targetWords: ["advised"],
  },
  {
    id: "passage_11",
    level: 4,
    text: "The reindeer pull Santa's sleigh across the sky. They are strong and fast. Children watch them fly over the houses.",
    questions: [
      {
        question: "What do the reindeer pull?",
        options: ["a car", "a sleigh", "a bike"],
        correctAnswer: 1,
      },
      {
        question: "Are the reindeer fast?",
        options: ["no", "yes", "very slow"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["reindeer"],
  },
  {
    id: "passage_12",
    level: 4,
    text: "Mei was disappointed when the show was cancelled. She had worked for many days to prepare. But she will try again next time.",
    questions: [
      {
        question: "Why was Mei disappointed?",
        options: ["the show was cancelled", "she was sick", "she was busy"],
        correctAnswer: 0,
      },
      {
        question: "Will she try again?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["disappointed"],
  },
  {
    id: "passage_13",
    level: 4,
    text: "For Ali, homework is a priority. He does his homework first before he plays. He says school is important.",
    questions: [
      {
        question: "What is a priority for Ali?",
        options: ["play", "homework", "sleep"],
        correctAnswer: 1,
      },
      {
        question: "Does Ali do homework first?",
        options: ["yes", "no", "sometimes"],
        correctAnswer: 0,
      },
    ],
    targetWords: ["priority"],
  },
  {
    id: "passage_14",
    level: 4,
    text: "The old machine sits idle in the corner. Nobody uses it anymore. The owner hopes to fix it one day.",
    questions: [
      {
        question: "Where is the idle machine?",
        options: ["in the room", "in the corner", "in the yard"],
        correctAnswer: 1,
      },
      {
        question: "Does anyone use it?",
        options: ["yes", "no", "sometimes"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["idle"],
  },
  {
    id: "passage_15",
    level: 4,
    text: "Mum keeps the receipt from the shop. She puts it in her bag. She can look at it if she has a question.",
    questions: [
      {
        question: "What does Mum keep?",
        options: ["a book", "a receipt", "a toy"],
        correctAnswer: 1,
      },
      {
        question: "Where does she put it?",
        options: ["on the table", "in the bin", "in her bag"],
        correctAnswer: 2,
      },
    ],
    targetWords: ["receipt"],
  },
  {
    id: "passage_16",
    level: 4,
    text: "He has a fractured bone in his arm. It hurts when he moves it. The doctor puts it in a cast.",
    questions: [
      {
        question: "What is fractured?",
        options: ["his leg", "his arm", "his hand"],
        correctAnswer: 1,
      },
      {
        question: "Did it hurt?",
        options: ["yes", "no", "maybe"],
        correctAnswer: 0,
      },
    ],
    targetWords: ["fractured"],
  },
  {
    id: "passage_17",
    level: 4,
    text: "The principal sits in his office at school. He helps solve problems. Children go to see him when they have trouble.",
    questions: [
      {
        question: "Where is the principal?",
        options: ["in the classroom", "in his office", "in the yard"],
        correctAnswer: 1,
      },
      {
        question: "Does he help children?",
        options: ["no", "yes", "sometimes"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["principal"],
  },
  {
    id: "passage_18",
    level: 4,
    text: "The secluded cottage sits far from town. Nobody lives near it. It is very quiet and peaceful.",
    questions: [
      {
        question: "Is the cottage near town?",
        options: ["yes", "no", "maybe"],
        correctAnswer: 1,
      },
      {
        question: "Is it quiet?",
        options: ["no", "yes", "very loud"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["secluded"],
  },
  {
    id: "passage_19",
    level: 4,
    text: "She walks on the pavement to school. The pavement is hard and smooth. She likes to skip as she walks.",
    questions: [
      {
        question: "What does she walk on?",
        options: ["the grass", "the road", "the pavement"],
        correctAnswer: 2,
      },
      {
        question: "What does she do as she walks?",
        options: ["run", "skip", "jump"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["pavement"],
  },
  {
    id: "passage_20",
    level: 4,
    text: "The cat hides underneath the table. Nobody sees it there. It sleeps and rests all day.",
    questions: [
      {
        question: "Where is the cat?",
        options: ["on the table", "under the table", "next to the table"],
        correctAnswer: 1,
      },
      {
        question: "What does the cat do?",
        options: ["play", "eat", "sleep"],
        correctAnswer: 2,
      },
    ],
    targetWords: ["underneath"],
  },
  {
    id: "passage_21",
    level: 4,
    text: "The injured dog needs help. A kind man carries it to the animal doctor. The doctor helps make it feel better.",
    questions: [
      {
        question: "Is the dog injured?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
      {
        question: "Who carries the dog?",
        options: ["a child", "a man", "a woman"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["injured"],
  },
  {
    id: "passage_22",
    level: 2,
    text: "She carried the heavy box into the house. It was very big and hard to hold. She put it in the corner.",
    questions: [
      {
        question: "What did she carry?",
        options: ["a bag", "a box", "a book"],
        correctAnswer: 1,
      },
      {
        question: "Where did she put it?",
        options: ["on the table", "in the corner", "at the door"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["carried"],
  },
  {
    id: "passage_23",
    level: 4,
    text: "My favourite episodes of the show make me laugh. Each episode tells a funny story. I watch them over and over.",
    questions: [
      {
        question: "What are your favourite episodes?",
        options: ["sad story", "funny story", "scary story"],
        correctAnswer: 1,
      },
      {
        question: "Do you watch them?",
        options: ["no", "yes", "sometimes"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["episodes"],
  },
  {
    id: "passage_24",
    level: 4,
    text: "We go to the aquarium and see many fish. The fish have beautiful colours. We see a big shark too.",
    questions: [
      {
        question: "Where do they go?",
        options: ["to the beach", "to the aquarium", "to the park"],
        correctAnswer: 1,
      },
      {
        question: "Do they see a shark?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["aquarium"],
  },
  {
    id: "passage_25",
    level: 4,
    text: "The circus comes to town. We see acrobats, clowns, and elephants. It is the best show of the year.",
    questions: [
      {
        question: "What comes to town?",
        options: ["a movie", "a circus", "a school"],
        correctAnswer: 1,
      },
      {
        question: "Is it a good show?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["circus"],
  },
  {
    id: "passage_26",
    level: 4,
    text: "She wears an elegant dress to the party. The dress is white and shiny. Everyone says she looks beautiful.",
    questions: [
      {
        question: "What is the dress like?",
        options: ["ugly", "old", "elegant"],
        correctAnswer: 2,
      },
      {
        question: "What colour is the dress?",
        options: ["black", "white", "blue"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["elegant"],
  },
  {
    id: "passage_27",
    level: 4,
    text: "Smuggling is against the law. Police catch people who try to smuggle things. They go to jail.",
    questions: [
      {
        question: "Is smuggling against the law?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
      {
        question: "What happens to smugglers?",
        options: ["they go home", "they get money", "they go to jail"],
        correctAnswer: 2,
      },
    ],
    targetWords: ["smuggling"],
  },
  {
    id: "passage_28",
    level: 4,
    text: "The influential leader changes many things in the country. People listen to her words. She helps make the country better.",
    questions: [
      {
        question: "Is the leader influential?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
      {
        question: "Does she help the country?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["influential"],
  },
  {
    id: "passage_29",
    level: 4,
    text: "The shop assistant helps me find shoes. She asks what size I need. She brings many shoes for me to try.",
    questions: [
      {
        question: "Who helps you?",
        options: ["a teacher", "a shop assistant", "a parent"],
        correctAnswer: 1,
      },
      {
        question: "What do they help you find?",
        options: ["clothes", "shoes", "books"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["assistant"],
  },
  {
    id: "passage_30",
    level: 4,
    text: "She dresses appropriately for the rain. She wears a coat and boots. She will not get wet.",
    questions: [
      {
        question: "What is the weather like?",
        options: ["sunny", "rainy", "snowy"],
        correctAnswer: 1,
      },
      {
        question: "What does she wear?",
        options: ["a light dress", "a coat and boots", "shorts"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["appropriately"],
  },
  {
    id: "passage_31",
    level: 4,
    text: "Many vehicles are in the car park. There are cars, buses, and lorries. The car park is very full.",
    questions: [
      {
        question: "What is in the car park?",
        options: ["houses", "vehicles", "trees"],
        correctAnswer: 1,
      },
      {
        question: "Is the car park full?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["vehicles"],
  },
  {
    id: "passage_32",
    level: 4,
    text: "At dusk, the sky turns orange and pink. The sun is going down. It is time to go home.",
    questions: [
      {
        question: "What time is dusk?",
        options: ["morning", "afternoon", "when the sun goes down"],
        correctAnswer: 2,
      },
      {
        question: "What colour is the sky?",
        options: ["blue", "orange and pink", "black"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["dusk"],
  },
  {
    id: "passage_33",
    level: 3,
    text: "Ice cream is her favourite dessert. She loves to eat it after lunch. Vanilla is her favourite flavour.",
    questions: [
      {
        question: "What is dessert?",
        options: ["a meal", "food after a meal", "a drink"],
        correctAnswer: 1,
      },
      {
        question: "What flavour does she like?",
        options: ["chocolate", "vanilla", "strawberry"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["dessert"],
  },
  {
    id: "passage_34",
    level: 4,
    text: "She takes a cooking course to learn new recipes. The course has ten lessons. She learns a lot of new skills.",
    questions: [
      {
        question: "What course does she take?",
        options: ["drawing", "cooking", "maths"],
        correctAnswer: 1,
      },
      {
        question: "How many lessons are there?",
        options: ["five", "ten", "twenty"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["course"],
  },
  {
    id: "passage_35",
    level: 4,
    text: "He is picky about food. He only likes certain things. His mother has to cook his favourite dish.",
    questions: [
      {
        question: "Is he picky?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
      {
        question: "What kind of food does he like?",
        options: ["all food", "only certain things", "no food"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["picky"],
  },
  {
    id: "passage_36",
    level: 2,
    text: "My stomach hurts when I eat too much. I hold my stomach and feel sorry. Now I will eat less.",
    questions: [
      {
        question: "What hurts?",
        options: ["head", "leg", "stomach"],
        correctAnswer: 2,
      },
      {
        question: "Why does it hurt?",
        options: ["eating too much", "too cold", "too hot"],
        correctAnswer: 0,
      },
    ],
    targetWords: ["stomach"],
  },
  {
    id: "passage_37",
    level: 4,
    text: "The puppy is adorable. It is cute and fluffy. Everyone wants to hold it and play with it.",
    questions: [
      {
        question: "What is adorable?",
        options: ["the house", "the puppy", "the car"],
        correctAnswer: 1,
      },
      {
        question: "Is it cute?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["adorable"],
  },
  {
    id: "passage_38",
    level: 4,
    text: "She grieved when her pet dog died. The dog was part of her family. She cried and missed it very much.",
    questions: [
      {
        question: "Did she grieve?",
        options: ["no", "yes", "maybe"],
        correctAnswer: 1,
      },
      {
        question: "Why did she grieve?",
        options: ["her pet died", "she was sad", "she was angry"],
        correctAnswer: 0,
      },
    ],
    targetWords: ["grieved"],
  },
  {
    id: "passage_39",
    level: 2,
    text: "He stepped onto the boat carefully. He made sure not to fall. The water was deep under the boat.",
    questions: [
      {
        question: "What did he step on?",
        options: ["the ground", "the boat", "the bridge"],
        correctAnswer: 1,
      },
      {
        question: "Is the water deep?",
        options: ["no", "yes", "shallow"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["stepped"],
  },
  {
    id: "passage_40",
    level: 4,
    text: "The solemn ceremony was very quiet. Everyone wore black clothes. They showed respect with quiet hearts.",
    questions: [
      {
        question: "What kind of ceremony?",
        options: ["happy", "solemn", "fun"],
        correctAnswer: 1,
      },
      {
        question: "Is it quiet?",
        options: ["no", "yes", "very loud"],
        correctAnswer: 1,
      },
    ],
    targetWords: ["solemn"],
  },
  {
    id: "passage_41",
    level: 1,
    text: "Sam has a red ball. He plays with the ball in the park. His dog runs after it.",
    questions: [
      { question: "Where does Sam play?", options: ["in the park", "at school", "in his bed"], correctAnswer: 0 },
      { question: "Who runs after the ball?", options: ["his dog", "his cat", "his sister"], correctAnswer: 0 },
    ],
    targetWords: ["ball", "park", "dog"],
  },
  {
    id: "passage_42",
    level: 1,
    text: "Every morning my mother buys bread. We eat it with an egg. Then I walk to school.",
    questions: [
      { question: "What does mother buy?", options: ["bread", "a book", "a ball"], correctAnswer: 0 },
      { question: "Where do I go after I eat?", options: ["to school", "to the park", "to bed"], correctAnswer: 0 },
    ],
    targetWords: ["bread", "morning", "school"],
  },
  {
    id: "passage_43",
    level: 1,
    text: "The cat sits under a tree. She is warm in the sun. A bird sings above her.",
    questions: [
      { question: "Where does the cat sit?", options: ["under a tree", "on a bus", "in a box"], correctAnswer: 0 },
      { question: "What does the bird do?", options: ["it sings", "it sleeps", "it runs"], correctAnswer: 0 },
    ],
    targetWords: ["cat", "tree", "bird"],
  },
  {
    id: "passage_44",
    level: 1,
    text: "It is raining. Ben looks out of the window. He cannot play outside today.",
    questions: [
      { question: "What is the weather like?", options: ["it is raining", "it is hot", "it is windy"], correctAnswer: 0 },
      { question: "Why can Ben not play outside?", options: ["it is raining", "he is ill", "it is late"], correctAnswer: 0 },
    ],
    targetWords: ["rain", "window", "play"],
  },
  {
    id: "passage_45",
    level: 1,
    text: "My teacher gave me a new book. It is about a brave girl. I read it every night.",
    questions: [
      { question: "Who gave me the book?", options: ["my teacher", "my brother", "my friend"], correctAnswer: 0 },
      { question: "What is the girl in the book like?", options: ["brave", "tired", "sad"], correctAnswer: 0 },
    ],
    targetWords: ["teacher", "book", "brave"],
  },
  {
    id: "passage_46",
    level: 1,
    text: "Two fish live in a glass box of water. They swim all day. I feed them before I sleep.",
    questions: [
      { question: "Where do the fish live?", options: ["in water", "in a tree", "in the sand"], correctAnswer: 0 },
      { question: "When do I feed them?", options: ["before I sleep", "at school", "in the car"], correctAnswer: 0 },
    ],
    targetWords: ["fish", "water", "sleep"],
  },
  {
    id: "passage_47",
    level: 1,
    text: "My baby sister is very small. She sleeps in the afternoon. I must be quiet then.",
    questions: [
      { question: "When does the baby sleep?", options: ["in the afternoon", "at night", "in the morning"], correctAnswer: 0 },
      { question: "What must I be?", options: ["quiet", "fast", "brave"], correctAnswer: 0 },
    ],
    targetWords: ["baby", "sister", "afternoon"],
  },
  {
    id: "passage_48",
    level: 1,
    text: "The bus stops at the end of our street. Father and I wait for it. We go to the city together.",
    questions: [
      { question: "Where does the bus stop?", options: ["at the end of the street", "at school", "at the park"], correctAnswer: 0 },
      { question: "Where do they go?", options: ["to the city", "to the sea", "to bed"], correctAnswer: 0 },
    ],
    targetWords: ["bus", "street", "city"],
  },
  {
    id: "passage_49",
    level: 1,
    text: "I drink milk after dinner. My brother drinks water. We wash the cups together.",
    questions: [
      { question: "What do I drink?", options: ["milk", "water", "tea"], correctAnswer: 0 },
      { question: "What do we do with the cups?", options: ["we wash them", "we drop them", "we keep them"], correctAnswer: 0 },
    ],
    targetWords: ["drink", "water", "wash"],
  },
  {
    id: "passage_50",
    level: 1,
    text: "At night I look at the moon. It is huge and white. The stars are very small.",
    questions: [
      { question: "What do I look at?", options: ["the moon", "the sun", "a book"], correctAnswer: 0 },
      { question: "How big is the moon?", options: ["huge", "tiny", "flat"], correctAnswer: 0 },
    ],
    targetWords: ["night", "moon", "huge"],
  },
  {
    id: "passage_51",
    level: 1,
    text: "My friend and I play in the park. We run and we sing. When we are tired, we sit on the grass.",
    questions: [
      { question: "Who do I play with?", options: ["my friend", "my teacher", "my dog"], correctAnswer: 0 },
      { question: "What do they do when they are tired?", options: ["they sit down", "they run", "they sing"], correctAnswer: 0 },
    ],
    targetWords: ["friend", "play", "tired"],
  },
  {
    id: "passage_52",
    level: 1,
    text: "A bird made a home in our tree. Every morning it sings. My mother says it is happy.",
    questions: [
      { question: "Where did the bird make its home?", options: ["in our tree", "in our house", "on the street"], correctAnswer: 0 },
      { question: "When does the bird sing?", options: ["every morning", "every night", "at school"], correctAnswer: 0 },
    ],
    targetWords: ["bird", "home", "sing"],
  },
  {
    id: "passage_53",
    level: 2,
    text: "We grow flowers in our garden. My father waters them before work. The red ones are the most beautiful.",
    questions: [
      { question: "What do they grow?", options: ["flowers", "fruit", "trees"], correctAnswer: 0 },
      { question: "When does father water them?", options: ["before work", "after dinner", "at night"], correctAnswer: 0 },
    ],
    targetWords: ["garden", "grow", "beautiful"],
  },
  {
    id: "passage_54",
    level: 2,
    text: "A long bridge crosses the river. We walk over it slowly. The water below is very quiet.",
    questions: [
      { question: "What crosses the river?", options: ["a bridge", "a boat", "a road"], correctAnswer: 0 },
      { question: "What is the water like?", options: ["quiet", "loud", "dirty"], correctAnswer: 0 },
    ],
    targetWords: ["bridge", "river", "quiet"],
  },
  {
    id: "passage_55",
    level: 2,
    text: "My mother cooks in the kitchen. Today she is making bread and cheese. The smell makes me hungry.",
    questions: [
      { question: "Where does mother cook?", options: ["in the kitchen", "in the garden", "at the market"], correctAnswer: 0 },
      { question: "How does the smell make me feel?", options: ["hungry", "tired", "angry"], correctAnswer: 0 },
    ],
    targetWords: ["kitchen", "cook", "hungry"],
  },
  {
    id: "passage_56",
    level: 2,
    text: "On Sunday we go to the market. We buy fruit and chicken. Mother counts the money carefully.",
    questions: [
      { question: "What do they buy?", options: ["fruit and chicken", "toys and books", "shoes"], correctAnswer: 0 },
      { question: "What does mother count?", options: ["the money", "the fruit", "the days"], correctAnswer: 0 },
    ],
    targetWords: ["market", "fruit", "count"],
  },
  {
    id: "passage_57",
    level: 2,
    text: "It snowed all night. In the morning the road was white and cold. We could not see the path at all.",
    questions: [
      { question: "When did it snow?", options: ["all night", "all morning", "for a week"], correctAnswer: 0 },
      { question: "What could they not see?", options: ["the path", "the sun", "the house"], correctAnswer: 0 },
    ],
    targetWords: ["snow", "cold", "path"],
  },
  {
    id: "passage_58",
    level: 2,
    text: "My aunt is a nurse at the hospital. She helps sick people all day. She comes home very tired.",
    questions: [
      { question: "Where does my aunt work?", options: ["at the hospital", "at school", "at the market"], correctAnswer: 0 },
      { question: "How does she come home?", options: ["very tired", "very angry", "very hungry"], correctAnswer: 0 },
    ],
    targetWords: ["nurse", "hospital", "help"],
  },
  {
    id: "passage_59",
    level: 2,
    text: "I wrote a letter to my cousin. I told her about my new school. She was happy to hear from me.",
    questions: [
      { question: "Who did I write to?", options: ["my cousin", "my teacher", "my brother"], correctAnswer: 0 },
      { question: "What did I write about?", options: ["my new school", "my dog", "the weather"], correctAnswer: 0 },
    ],
    targetWords: ["letter", "write", "school"],
  },
  {
    id: "passage_60",
    level: 2,
    text: "We walked up the mountain together. The path was rough and long. At the top we could see the whole city.",
    questions: [
      { question: "What was the path like?", options: ["rough and long", "soft and short", "wet"], correctAnswer: 0 },
      { question: "What could they see at the top?", options: ["the whole city", "the sea", "a river"], correctAnswer: 0 },
    ],
    targetWords: ["mountain", "rough", "path"],
  },
  {
    id: "passage_61",
    level: 2,
    text: "My sister keeps her doll on the bed. She shares her toys with me. We are never angry for long.",
    questions: [
      { question: "Where does she keep her doll?", options: ["on the bed", "in a box", "at school"], correctAnswer: 0 },
      { question: "What does she do with her toys?", options: ["she shares them", "she hides them", "she sells them"], correctAnswer: 0 },
    ],
    targetWords: ["doll", "toy", "share"],
  },
  {
    id: "passage_62",
    level: 2,
    text: "Our guest told us a funny story. Everyone began to laugh. He is a very friendly man.",
    questions: [
      { question: "What did the guest tell?", options: ["a funny story", "a sad story", "a lie"], correctAnswer: 0 },
      { question: "What is the guest like?", options: ["friendly", "quiet", "angry"], correctAnswer: 0 },
    ],
    targetWords: ["guest", "laugh", "friendly"],
  },
  {
    id: "passage_63",
    level: 3,
    text: "A lion rests in the shade all afternoon. The desert is far too hot to hunt in. He waits for the cool evening.",
    questions: [
      { question: "Why does the lion rest?", options: ["it is too hot", "he is ill", "he is full"], correctAnswer: 0 },
      { question: "When will he hunt?", options: ["in the evening", "at noon", "in the morning"], correctAnswer: 0 },
    ],
    targetWords: ["lion", "desert"],
  },
  {
    id: "passage_64",
    level: 3,
    text: "Our school held a sport day on Saturday. My class ran the fastest of all. We won a prize for the wall.",
    questions: [
      { question: "When was the sport day?", options: ["on Saturday", "on Monday", "last month"], correctAnswer: 0 },
      { question: "What did the class win?", options: ["a prize", "a ball", "a cup of milk"], correctAnswer: 0 },
    ],
    targetWords: ["sport", "prize"],
  },
  {
    id: "passage_65",
    level: 3,
    text: "We had lunch at a small restaurant. I ate a cheese sandwich and drank water. It was cheap and very good.",
    questions: [
      { question: "Where did they have lunch?", options: ["at a restaurant", "at home", "at school"], correctAnswer: 0 },
      { question: "What did I eat?", options: ["a sandwich", "rice", "an egg"], correctAnswer: 0 },
    ],
    targetWords: ["restaurant", "sandwich", "cheap"],
  },
  {
    id: "passage_66",
    level: 3,
    text: "The thunder was so loud that my little brother hid under a pillow. I told him it could not hurt him. Soon the storm passed.",
    questions: [
      { question: "Where did my brother hide?", options: ["under a pillow", "under the bed", "in the kitchen"], correctAnswer: 0 },
      { question: "What happened to the storm?", options: ["it passed", "it grew", "it stayed all night"], correctAnswer: 0 },
    ],
    targetWords: ["thunder", "loud", "pillow"],
  },
  {
    id: "passage_67",
    level: 3,
    text: "My uncle is a pilot. He begins each journey at the airport before dawn. He has seen almost every city in the world.",
    questions: [
      { question: "What is my uncle?", options: ["a pilot", "a driver", "a farmer"], correctAnswer: 0 },
      { question: "When does his journey begin?", options: ["before dawn", "at noon", "at night"], correctAnswer: 0 },
    ],
    targetWords: ["pilot", "airport", "journey"],
  },
  {
    id: "passage_68",
    level: 3,
    text: "The farmer works in the mud after the rain. His boots are heavy and dirty. He does not mind at all.",
    questions: [
      { question: "What does the farmer work in?", options: ["mud", "sand", "snow"], correctAnswer: 0 },
      { question: "What are his boots like?", options: ["heavy and dirty", "new", "light"], correctAnswer: 0 },
    ],
    targetWords: ["farmer", "mud", "heavy"],
  },
  {
    id: "passage_69",
    level: 3,
    text: "A rabbit ate the grass at the bottom of our garden. When I came near, it did not move. Then it was gone in a flash.",
    questions: [
      { question: "What did the rabbit eat?", options: ["grass", "fruit", "bread"], correctAnswer: 0 },
      { question: "What did the rabbit do when I came near?", options: ["it did not move", "it ran at once", "it slept"], correctAnswer: 0 },
    ],
    targetWords: ["rabbit", "bottom"],
  },
  {
    id: "passage_70",
    level: 3,
    text: "The artist painted a busy street. She held a small mirror to check her work. Every window in the painting was different.",
    questions: [
      { question: "What did the artist paint?", options: ["a busy street", "a quiet garden", "the sea"], correctAnswer: 0 },
      { question: "What did she hold?", options: ["a mirror", "a book", "a brush"], correctAnswer: 0 },
    ],
    targetWords: ["artist", "mirror", "busy"],
  },
];
