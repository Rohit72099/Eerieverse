export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  genre: string;
  likes: number;
  comments: number;
  readTime: string;
  coverImage?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
}

export const mockStories: Story[] = [
  {
    id: "1",
    title: "The Whispering Woods",
    excerpt: "Deep in the forest, something ancient awakens. Sarah's camping trip becomes a nightmare when she hears her name being called from the darkness...",
    content: `The camping trip was meant to be relaxing. Sarah had needed this – a break from the city, from work, from everything. But now, standing at the edge of the clearing as darkness fell, she wondered if she'd made a terrible mistake.

The whispers started just after sunset. At first, she thought it was the wind rustling through the leaves. But then she heard it clearly: her name, carried on the breeze from deep within the woods.

"Sarah... Sarah..."

She tried to ignore it, huddling closer to the fire. But the voice was persistent, growing louder with each passing hour. It sounded almost familiar, like an old friend she couldn't quite place.

Against her better judgment, she grabbed her flashlight and ventured into the trees. The whispers led her deeper and deeper, until she could no longer see the glow of her campfire behind her.

That's when she saw it – a figure standing in the moonlight, its back to her. As it slowly turned around, Sarah's blood ran cold. The face staring back at her was her own.`,
    author: "Emma Darkwood",
    genre: "Horror",
    likes: 234,
    comments: 45,
    readTime: "8 min",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "The Last Transmission",
    excerpt: "A mysterious radio signal from deep space contains a terrifying message. Dr. Chen discovers that some mysteries are better left unsolved...",
    content: `Dr. Chen had spent fifteen years listening to the cosmos, hoping for a sign of intelligent life. Tonight, she finally got her answer – and wished she hadn't.

The signal came through at 3:47 AM, a pattern too complex to be natural. Her hands trembled as she decoded the message, revealing words in perfect English:

"DO NOT ANSWER. DO NOT ANSWER. THEY ARE LISTENING."

Before she could process this, another message followed: "WE TRIED TO WARN YOU. IT'S TOO LATE. THEY'RE ALREADY THERE."

Chen spun around in her chair. The observatory was empty, but she couldn't shake the feeling that she was being watched. The computers flickered, and a new message appeared on every screen:

"HELLO, DR. CHEN. WE'VE BEEN WAITING FOR YOU TO LISTEN."`,
    author: "Marcus Steel",
    genre: "Sci-Fi Horror",
    likes: 456,
    comments: 78,
    readTime: "12 min",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Mirror, Mirror",
    excerpt: "An antique mirror purchased at an estate sale brings something sinister into Rebecca's home. Her reflection starts acting on its own...",
    content: `The mirror was beautiful – an ornate Victorian piece with a silver frame. Rebecca couldn't believe her luck finding it at the estate sale.

She hung it in her bedroom, admiring how it caught the light. That night, she woke to find her reflection staring at her, even though she was lying down with her eyes closed.

Over the following days, things got worse. Her reflection would move seconds before she did, as if anticipating her actions. Sometimes, it would smile when she was crying, or scowl when she was happy.

One morning, Rebecca approached the mirror to find her reflection wasn't there at all. Panicked, she reached out to touch the glass – and felt cold fingers grab her wrist from the other side.

As she was pulled through, she heard her own voice behind her, in the real world: "Finally. I've been trapped in there for so long."`,
    author: "Victoria Graves",
    genre: "Supernatural",
    likes: 567,
    comments: 89,
    readTime: "10 min",
    createdAt: "2024-01-18",
  },
  {
    id: "4",
    title: "The Forgotten Floor",
    excerpt: "An elevator in David's office building sometimes stops at a floor that doesn't exist. When he steps out, he finds himself in a place that defies explanation...",
    content: `David had worked in the building for three years before he noticed it. The elevator would occasionally pause between the 7th and 8th floors, and the button panel would briefly show "7½."

Curiosity got the better of him one late evening. When the elevator stopped at the mysterious floor, he stepped out before the doors could close.

The 7½ floor was identical to the others – same carpet, same fluorescent lights, same office doors. But something was wrong. The air felt thick, time seemed to move differently, and all the office doors led to the same room.

In that room, David found files – thousands of them, all marked with his name. Each file contained details about his life: conversations he'd had, thoughts he'd never spoken aloud, decisions he had yet to make.

At the bottom of one file, stamped in red ink: "SIMULATION 7.5 - SUBJECT BECOMING AWARE - RECOMMEND RESET."

The lights flickered. When they came back on, David was in the elevator, heading down. He had no memory of the 7½ floor, but a note was clutched in his hand: "DON'T GO BACK."`,
    author: "James Holloway",
    genre: "Mystery",
    likes: 389,
    comments: 92,
    readTime: "15 min",
    createdAt: "2024-01-22",
  },
  {
    id: "5",
    title: "The Doll House",
    excerpt: "When Lisa inherits her grandmother's house, she finds a perfect miniature replica in the attic. Whatever happens to the dollhouse happens to the real house...",
    content: `The dollhouse was an exact replica of the Victorian mansion Lisa had inherited. Every room, every piece of furniture, perfectly recreated in miniature.

She discovered its power by accident. While cleaning, she moved a tiny chair in the dollhouse living room. Seconds later, the real chair in her living room scraped across the floor on its own.

At first, Lisa was delighted. She could rearrange her furniture without lifting a finger! But then she noticed something disturbing: there were tiny dolls in the miniature house – three of them. One looked disturbingly like her.

One night, she woke to find one of the tiny dolls standing at the dollhouse window, looking out. In the morning, she found muddy footprints in her real house, leading from the window to her bedroom door.

The next day, one of the dolls was gone from the dollhouse. Lisa searched everywhere but couldn't find it. That night, she heard footsteps in the hall – small, measured, deliberate.

When she opened her bedroom door, she saw it: a doll, life-sized now, standing in the hallway with a smile frozen on its porcelain face. Behind it, two more dolls were growing, their joints creaking as they expanded.

Lisa ran to the attic, grabbed the dollhouse, and hurled it out the window. It shattered on the driveway below. She heard three thuds behind her – the sound of three bodies hitting the floor.

When she turned around, the dolls were gone. But so was the real house around her. She was standing in an attic that was somehow too large, looking down at a broken dollhouse that was the size of a real house.

A giant hand reached down from above. A voice, impossibly loud, said: "This one's broken too. I'll make a new one."`,
    author: "Sophie Nightshade",
    genre: "Horror",
    likes: 678,
    comments: 134,
    readTime: "18 min",
    createdAt: "2024-01-25",
  },
];

export const mockComments: Comment[] = [
  {
    id: "1",
    author: "DarkReader92",
    content: "This gave me chills! The atmosphere is incredible. Can't wait for more from this author.",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    author: "HorrorFan88",
    content: "The twist at the end was perfect. Didn't see it coming at all!",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    author: "NightOwl",
    content: "Reading this at 3 AM was a mistake... or was it? Brilliantly written!",
    timestamp: "1 day ago",
  },
];
