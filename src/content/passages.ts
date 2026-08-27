export interface Passage {
  id: string;
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
];
