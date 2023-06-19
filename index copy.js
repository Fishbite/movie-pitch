import { process } from "/env";
import { Configuration, OpenAIApi } from "openai";

const setupInputContainer = document.getElementById("setup-input-container");
const movieBossText = document.getElementById("movie-boss-text");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

document.getElementById("send-btn").addEventListener("click", () => {
  const setupTextarea = document.getElementById("setup-textarea");
  const userInput = setupTextarea.value;
  if (setupTextarea.value) {
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`;
    movieBossText.innerText = `My grey cells are workin' on it, hang on...`;
  }
  fetchBotReply(userInput);
  fetchSynopsis(userInput);
});

async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    /*
1. Refactor this prompt to use examples of an outline and an 
   enthusiastic response. Be sure to keep the length of your 
   examples reasonably short, say 20 words or so.
*/
    prompt: `Generate a short message to enthusiastically say an outline sounds terrifying. I'll need a while to think about it.
    ###
    outline: Say Grandma dies crossing the road. Grandaughter seeks revenge. I'm pondering the miriad of possibilities, bear with.... I love the gruesome bit
    ###
    outline: ${outline}
    message:`,
    max_tokens: 60, // defaults to 16 i.e. short/incomplete answer
    // max_tokens does not help control how concise the response is
    // We should set it high enough to allow a full response from
    // OpenAI
  });
  movieBossText.innerText = response.data.choices[0].text.trim();
  // console.log(response);
}

async function fetchSynopsis(outline) {
  /*
Challenge:
  1. Set up an API call with model, prompt, and max_tokens properties.
  2. The prompt should ask for a synopsis for a movie based on the 
    outline supplied by the user.
*/
  /* 
Challenge:
  1. Refactor the prompt to use one or more examples. 
  2. Remember to separate the instruction from the 
     example with ### or '''.
*/
  /*
Challenge:
    1. Ask for actors names in brackets after each character. 
       You could also suggest that OpenAI thinks of actors that would 
       particularly suit the role. 
*/
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate an engaging, professional and marketable movie synopsis based on an outline. Choose actors that would be morbidly suitable for each role.
    outline:A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
    synopsis:The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    ###
    outline: ${outline}
    synopsis:`,

    max_tokens: 700, // 700 is a good \as we need many words
  });

  const synopsis = response.data.choices[0].text.trim();
  document.getElementById("output-text").innerText = synopsis;
  fetchTitle(synopsis);
}

// ***** Un-comment this vvv if refactor fails ***** \\
// async function fetchTitle(synopsis) {
//   const response = await openai.createCompletion({
//     model: "text-davinci-003",
//     prompt: `create a horrifyingly gruesome short title based on this synopsis: ${synopsis}`,
//     max_tokens: 25,
//     temperature: 0.75,
//   });

//   const title = response.data.choices[0].text.trim();
//   document.getElementById("output-title").innerText = title;

//   // fetchStars(synopsis);
//   // fetchImagePrompt(title, synopsis);
// }
// ***** Un-comment this ^^^ if refactor fails ***** \\

// // ***** Refactor `const response` ***** \\
// // i.e. create a function to eliminate repative code
async function fetchTitle(synopsis) {
  const title = await getTxtDavi003Result(
    `create a horrifyingly gruesome short title based on this synopsis: ${synopsis}`
  );

  // console.log("response in fetchTitle():", response);
  // const title = response;
  console.log("Title:", title);
  document.getElementById("output-title").innerText = title;
  fetchStars(synopsis);
  fetchImagePrompt(title, synopsis);
}

async function getTxtDavi003Result(prompt, tokens = 25, temperature = 0.75) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: tokens,
    temperature: temperature,
  });

  const output = response.data.choices[0].text.trim();
  // console.log("getTxtDavi003Response output:", output);
  return output;
}
// ***** Refactor `const response` ***** \\

async function fetchStars(synopsis) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    // extract the stars names from the synopsis
    prompt: `extract the names in brackets from the synopsis
    ###
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    names: Tom Cruise, Val Kilmer, Kelly McGillis 
    ###
    synopsis: ${synopsis}
    names:`,
    max_tokens: 30,
  });
  document.getElementById("output-stars").innerText =
    response.data.choices[0].text.trim();
  console.log(response);
}

async function fetchImagePrompt(title, synopsis) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    /*
Challenge:
1. Write a prompt that will generate an image prompt that we can 
   use to get artwork for our movie idea.
   OpenAI has no knowledge of our characters. So the image prompt 
   needs descriptions not names!
2. Add temperature if you think it's needed.
*/
    prompt: `Use a title and synopsis to generate a short description of a poster image for the movie. Don't include any character or actor names.###
    title: Love's Time Warp
    synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
    image-description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is super-imposed over the scene.
    ###
    title: zero Earth
    synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
    image-description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
    ###
    title: Animal Revolution
    synopsis: In a world gone mad, Dr. Victor Drazen (Daniel Craig) has invented a machine that can control the minds of all humans. With the fate of humanity at stake, an unlikely group of intelligent animals must take on the challenge of stopping Drazen and his evil plan. Led by Golden Retriever Max (Chris Pratt) and his best friend, the wise-cracking squirrel Scooter (Will Arnett), they enlist the help of a street-smart raccoon named Rocky (Anna Kendrick) and a brave hawk named Talon (Zoe Saldana). Together, they must find a way to stop Drazen before he can enslave humanity.
    image-description:  A group of animals, led by a golden retriever, standing in a defensive line in a dark alley. The animals are silhouetted against a backdrop of a towering city skyline, with a full moon in the sky above them. Sparks are flying from the claws of the hawk in the center of the group, and the raccoon is brandishing a makeshift weapon.
    ###
    title: ${title}
    synopsis: ${synopsis}
    image-description`,
    max_tokens: 100,
  });

  const imagePrompt = response.data.choices[0].text.slice(2); // slice crap off the front of the response i.e. the colon and white space (: )
  console.log(imagePrompt);
  fetchImageURL(imagePrompt);
}

async function fetchImageURL(imagePrompt) {
  const response = await openai.createImage({
    prompt: `${imagePrompt}. There should be no text in the image`,
    n: 1,
    size: "256x256",
    response_format: "url",
  });
  document.getElementById(
    "output-img-container"
  ).innerHTML = `<img src="${response.data.data[0].url}">`;

  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`;
  document.getElementById("view-pitch-btn").addEventListener("click", () => {
    document.getElementById("setup-container").style.display = "none";
    document.getElementById("output-container").style.display = "flex";
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`;
  });
}

/* **** The Results **** *\

  User's Prompt:
  Grandma Zol says goodbye to her granddaughter Fai, who's smiling face turns to a look of disbelieving horror as a series of hyper-cars strike Zol as she crosses the road. Bounced, splattered and spread across the road, Zol stood no chance. The driver that killed Granny was Nicholas Cage who was returning from filming 'Drive Angry. In a Bizarre twist, Milton (Cage's Character in 'Drive Angry') escaped 'The Accountant' and possessed Cage.

  The Result 1 of processing the above prompt:
  title:"Drive Angry, Goodbye Granny Zol"
  stars: Cicely Tyson, Yara Shahidi, Nicholas Cage
  synopsis: Grandma Zol (Cicely Tyson) has been the biggest influence in Fai's young life. She imparts her wisdom and stories of strength to the girl, helping Fai blossom into the beautiful person she is bound to become. But Zol's time on earth is coming to an end, and all that is left is for her to say goodbye to her beloved granddaughter Fai (Yara Shahidi). When tragedy unexpectedly strikes, Fai's carefree smile turns to a look of disbelief and horror as a series of hyper-cars driven by the infamous Nicholas Cage (Nicholas Cage) strike Granny Zol. Bounced, splattered and spread across the road, Zol stood no chance. The driver that killed Granny, Cage as he is returning from filming 'Drive Angry' now must own up to his mistake and face the consequences of his actions - and begin the long process of earning back Fai's trust and giving her the answers as why this tragedy befell her grandmother.

  Result 2:
  title: "Grandma Zol's Gruesome End at the Hands of Nicholas Cage's Possessed Character Milton"
  stars: Bette Midler, Gugu Mbatha-Raw, Nicholas Cage
  synopsis: Grandma Zol (Bette Midler) is the loving matriarch of the family, holding them all together with her incredible spirit and kind words. When she says her farewells to her beloved granddaughter Fai (Gugu Mbatha-Raw) after a visit, life takes a dark turn. Just as Grandma Zol steps into the crosswalk, a series of luxury hyper-cars comes careening down the street. Unable to stop in time, Grandma Zol is bounced, splattered, and spread across the road. Fai's smile transforms into a look of disbelieving horror as she watches her beloved grandmother get killed by the driver of the lead car. To her surprise, the driver is Nicholas Cage, returning from shooting his latest movie, 'Drive Angry'. It seems that Milton, Cage's character in 'Drive Angry', had escaped 'The Accountant' and possesses Cage. Against all odds, Fai and her family are determined to avenge Granny's death by bringing Milton to justice, no matter how supernatural the course.

  Result 3
  title: Grandma Zol's Tragic Fate: A Tale of Family Loss and Forgiveness
  stars: Suzanna Hamilton, Liya Kebede, Nicholas Cage
  synopsis: When Grandma Zol (Suzanna Hamilton) visits her beloved granddaughter, Fai (Liya Kebede), the pair shares a warm and touching moment. But then, in a tragic twist of fate, Grandma Zol is tragically killed by a series of powerful hyper-cars driven by Nicholas Cage, who is coming back from the filming of the action-thriller, Drive Angry. It turns out Milton (pictured by Cage for the movie), has possessed Cage's body, and in an outlandish and supernatural attempt to escape the grip of the Accountant, has come to take over Cage's life. In a heartbreaking story of family loss, Fai must cope with the trauma of feeling such a sudden and violent loss, and withstand her grief as she searches for "the one that got away." The ability to forgive and move forward will be hard, but thankfully, Fai finds strength and solace in the new relationships she develops in her journey to have justice for her grandmother.

  Prompt: Grandma Zol says goodbye to her granddaughter Fai, who's smiling face turns to a look of disbelieving horror as a series of hyper-cars strike Zol as she crosses the road. Bounced, splattered and spread across the road, Zol stood no chance. The driver that killed Granny was Nicholas Cage who was returning from filming 'Drive Angry. In a Bizarre twist, Milton (Cage's Character in 'Drive Angry') escaped 'The Accountant' and possessed Cage, it's now up to Fai to send Milton back to where he truly belongs.

  Result 4
  title: "Taming the Netherworld: Fai Cody's Grand Quest"
  stars: Hailee Steinfeld, Helen Mirren, Nicholas Cage, Susan Sarandon, Danny McBride
  synopsis: Thirteen-year-old Fai Cody (Hailee Steinfeld) is a fun-loving, sharp-witted girl living with her doting grandmother, Zol (Helen Mirren), in a quiet suburban town. But when an out-of-control vehicle careens through the street, her world is suddenly shattered as the car strikes and kills her beloved grandmother.

  The driver is revealed to be the Hollywood actor Nicholas Cage, in a car that should have been impossible for him to drive. But the truth is far more harrowing; the spirit of Cage's character from his latest movie, 'Drive Angry', has taken possession of Cage and escaped the netherworld. Fai is desperate to find out why the spirit was looking for her grandmother and how to put Milton back where he belongs. Filled with excitement, grief, and confusion, Fai embarks on a journey to tame Milton and uncover the mystery of her grandmother's spirit. With an unlikely alliance of her teacher, Miss Ryker (Susan Sarandon), and the renegade demon-hunter Abel (Danny McBride), Fai must battle against all odds to save both her grandmother’s and Nicholas Cage’s souls.

  Result 5
  title: "Grandma Zol's Final Drive: Fai vs. Milton"
  stars: Liu Yifei, Sylvia Hoeks, Nicholas Cage
  synposis: Fai (Liu Yifei) is an ordinary girl who loves a big dose of her grandma Zol (Sylvia Hoeks)'s wisdom every week during their late-night visits. But one night, Fai waves goodbye as Zol steps out onto the street - only to watch in disbelief as Zol is viciously struck by a series of hyper-cars driven by movie star Nicholas Cage (Nicholas Cage). Distraught, Fai investigates the circumstances of Zol's death and makes a bizarre discovery - Cage is being possessed by Milton (also Nicholas Cage), his character from the movie 'Drive Angry', who has escaped 'The Accountant', a mysterious figure from a dark universe. With her life turned upside down, Fai sets out to put Milton back where he belongs using the only weapon she has - her wits. Along the way, Fai battles the demons of her past and harnesses the power of friendship and love as she races against the clock to save the soul of her beloved Grandma Zol.

  Result 6
  title: 'Rage for Revenge: Fai & Grandma Zol's Final Journey'
  stars: Viola Davis, Madison Davenport, Nicholas Cage, Alia Shawkat
  synopsis: Grandmother Zol (Oscar-Award nominee Viola Davis) is beloved by her young granddaughter Fai (newcomer Madison Davenport). But in a heartbreaking moment, tragedy strikes when Zol is killed by an out-of-control hyper-car driven by Hollywood bad boy Nicholas Cage. Years later, Fai is confronted with the unexpected when Cage returns from filming the hit movie 'Drive Angry' possessed by the character he plays in the movie, a supernatural bounty hunter named Milton. Now it is up to Fai to face her fear and send Milton back to where he belongs. With the help of her best friend Button (Alia Shawkat) and her grandmother's spirit, Fai embarks on a thrilling journey filled with action and adventure as she races against the clock to catch up to Milton and put him back in his rightful place. 'Send Milton Back' is an edge-of-your-seat ride that will leave viewers raging for more.

  result 7
  title: "Fai vs. The Underworld: Grandma Zol's Final Revenge"
  stars: Shirley MacLaine, Alia Shawkat, Nicholas Cage 
  synopsis: When Grandma Zol (Shirley MacLaine) says goodbye to her beloved granddaughter Fai (Alia Shawkat), she unwittingly sets Fai on an incredible journey of discovery and retribution. After Granny Zol is tragically killed in a hit-and-run accident, Fai's anguish turns to shock when she learns that the person responsible is none other than Nicholas Cage – fresh off his stint as Milton in the cult film "Drive Angry". As Fai investigates the circumstances surrounding the accident, she discovers an incredible truth – that Milton has escaped the underworld and has possessed Cage. When Fai quickly learns the only way to return Milton to 'The Accountant' is to summon her own supernatural powers, she must find the strength and courage to confront Milton and bring him back to the netherworld where he truly belongs. Will Fai get justice for Granny Zol or is she doomed to fail? Find out in "Fai vs. The Underworld: Grandma Zol's Final Revenge"!
*/
