import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

// Extract the direct TCP URL from the prisma+postgres:// connection string
function getDirectUrl(): string {
  const dbUrl = process.env.DATABASE_URL!;
  const url = new URL(dbUrl);
  const apiKey = url.searchParams.get("api_key")!;
  const decoded = JSON.parse(
    Buffer.from(apiKey, "base64url").toString("utf-8")
  );
  return decoded.databaseUrl;
}

const pool = new pg.Pool({
  connectionString: getDirectUrl(),
  max: 1,
  ssl: false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding InkFlow database...\n");

  // ─── Clean existing data ────────────────────────────────
  await prisma.tagOnPost.deleteMany();
  await prisma.like.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Tags ────────────────────────────────────────
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Community", color: "#10B981" } }),
    prisma.tag.create({ data: { name: "Wellness", color: "#6366F1" } }),
    prisma.tag.create({ data: { name: "Remote Work", color: "#EF4444" } }),
    prisma.tag.create({ data: { name: "Mindfulness", color: "#8B5CF6" } }),
    prisma.tag.create({ data: { name: "Loneliness", color: "#F59E0B" } }),
    prisma.tag.create({ data: { name: "Elderly Care", color: "#EC4899" } }),
    prisma.tag.create({ data: { name: "Human Connection", color: "#3B49DF" } }),
    prisma.tag.create({ data: { name: "Ashram", color: "#14B8A6" } }),
    prisma.tag.create({ data: { name: "Technology", color: "#6B7280" } }),
    prisma.tag.create({ data: { name: "Mental Health", color: "#F97316" } }),
    prisma.tag.create({ data: { name: "Intergenerational", color: "#84CC16" } }),
    prisma.tag.create({ data: { name: "Purpose", color: "#A78BFA" } }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // ─── Create Users ───────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@inkflow.com",
      hashedPassword,
      role: "ADMIN",
      bio: "Platform administrator for InkFlow — the community bridging remote workers and ashram elders.",
      image: null,
    },
  });

  const author1 = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "sarah@inkflow.com",
      hashedPassword,
      role: "USER",
      bio: "Software engineer turned community builder. I spent a month working remotely from an ashram in Rishikesh — it changed everything about how I view loneliness.",
      image: null,
    },
  });

  const author2 = await prisma.user.create({
    data: {
      name: "Anita Kumar",
      email: "anita@inkflow.com",
      hashedPassword,
      role: "USER",
      bio: "Gerontologist and wellness advocate. I study how technology can reduce isolation in elderly communities and connect them with the modern world.",
      image: null,
    },
  });

  const author3 = await prisma.user.create({
    data: {
      name: "James Wilson",
      email: "james@inkflow.com",
      hashedPassword,
      role: "USER",
      bio: "Full-stack developer and remote work advocate. Co-founder of BridgeCall — a platform pairing remote professionals with ashram residents for weekly video conversations.",
      image: null,
    },
  });

  const author4 = await prisma.user.create({
    data: {
      name: "Emily Rodriguez",
      email: "emily@inkflow.com",
      hashedPassword,
      role: "USER",
      bio: "Social entrepreneur working at the intersection of remote work culture and elder wellbeing. Believes that curing loneliness starts with intentional human connection.",
      image: null,
    },
  });

  console.log("✅ Created 5 users (1 admin + 4 authors)");

  // ─── Create Posts ───────────────────────────────────────
  const postsData = [
    {
      title: "When Loneliness Meets Wisdom: One Month Working Remotely from a Rishikesh Ashram",
      slug: "working-remotely-rishikesh-ashram",
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      content: `<h2>The Day Everything Felt Empty</h2><p>It was 2 PM on a Tuesday, my third straight week working alone in a Mumbai apartment, when I realised I hadn't spoken to another human being in four days. Not a real conversation, anyway — Slack messages and Zoom calls don't count when you're craving actual presence.</p><p>I was a senior software engineer at a fast-growing fintech startup. By every external metric, my life was thriving. But the silence was deafening. Remote work had given me freedom and stripped me of community in the same stroke.</p><blockquote>"The most terrible poverty is loneliness and the feeling of being unloved." — Mother Teresa</blockquote><h2>The Unlikely Solution</h2><p>A colleague mentioned that her friend had spent two weeks working from an ashram in Rishikesh. Not to meditate all day — but to work normal hours while being embedded in a living community of people who had, in many ways, chosen intentional presence over distraction.</p><p>I booked a month-long stay almost immediately.</p><h2>Meeting Ramprasad-ji</h2><p>On my third morning, I met the elder I would come to consider one of the most influential people in my life. Ramprasad-ji was 78, a former school principal who had lived at the ashram for eleven years. Every day after my morning standups, I would sit with him at the chai stall near the library.</p><p>He had never used a smartphone. I was on mine constantly. Yet over those weeks, he taught me more about focused attention, genuine listening, and purposeful living than any productivity system ever had.</p><h2>What Remote Workers and Ashram Elders Share</h2><p>The irony struck me one afternoon: both groups are often invisible. Remote workers are present in offices only as avatars. Ashram elders are present in families only as occasional video calls on birthdays. Both are physically displaced from the communities they most need.</p><p>That realisation became the seed of something I couldn't yet name.</p><h2>Coming Home Changed</h2><p>I returned to my apartment, but I was no longer the same person who had left. I started a weekly video call ritual — pairing remote professionals I knew with elderly residents at the ashram who wanted to exchange stories, skills, and presence.</p><p>The response was overwhelming. Within three months, we had 40 pairs. Within six, 200. The loneliness didn't vanish overnight. But the silence did.</p>`,
      excerpt: "I spent a month working from a Rishikesh ashram and sat with a 78-year-old elder every morning. What I found changed how I understand loneliness — and what cures it.",
      readTime: 9,
      views: 3840,
      status: "PUBLISHED" as const,
      authorId: author1.id,
      tagNames: ["Remote Work", "Ashram", "Human Connection", "Loneliness"],
    },
    {
      title: "The Loneliness Epidemic Nobody in Tech is Talking About",
      slug: "loneliness-epidemic-remote-work-tech",
      coverImage: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=1200&q=80",
      content: `<h2>A Silent Crisis in Plain Sight</h2><p>In 2023, the US Surgeon General declared loneliness a public health epidemic. In 2024, studies showed remote workers were 2.5x more likely to report feeling isolated than office workers. Yet somehow, the conversation in tech circles keeps circling back to productivity frameworks and async communication norms.</p><p>We are missing the point entirely.</p><h2>The Numbers That Should Wake Us Up</h2><p>Here is what the data shows:<br/>— Over 60% of fully remote employees report feeling lonely often or always in a recent survey of 4,000 tech workers.<br/>— The elderly population in residential and ashram communities often mirrors this number: 58% report rarely or never feeling a meaningful human connection on most days.<br/>— Chronic loneliness is associated with a 26% increased risk of premature death — comparable to smoking 15 cigarettes a day.</p><p>Two populations, separated by decades and context, drowning in the same invisible ocean.</p><h2>Why Existing Solutions Fall Short</h2><p>Companies have tried virtual coffee chats, online trivia nights, mandatory team offsites. Elders are sent tablets and taught to use WhatsApp. These interventions treat the symptom, not the root.</p><p>Real connection requires <em>meaning</em>. It requires someone who has lived a full life meeting someone who is figuring theirs out. It requires reciprocity — the elder who teaches patience, the remote worker who explains AI, each transformed by the exchange.</p><h2>A Different Frame</h2><p>What if instead of engineering around loneliness — better tools, better meeting rhythms — we engineered <em>toward</em> connection? What if remote work policies actively encouraged employees to work from elder-care communities, ashrams, and retirement homes for a week or month each year?</p><p>Not as charity. As mutual healing.</p><h2>Where We Go From Here</h2><p>The technology to enable this exists. What's missing is the cultural will to treat elder connection as a core part of work-life design, not an afterthought. I believe that changes when enough people in tech have the experience I had in Rishikesh.</p><p>Share this. Talk about it. And if you work remotely — consider where your next sprint review could happen.</p>`,
      excerpt: "Remote workers and ashram elders share the same invisible epidemic. The data is damning. But so is the opportunity.",
      readTime: 7,
      views: 5120,
      status: "PUBLISHED" as const,
      authorId: author4.id,
      tagNames: ["Loneliness", "Remote Work", "Mental Health", "Community"],
    },
    {
      title: "What 80-Year-Old Monks Taught Me About Deep Work",
      slug: "monks-deep-work-remote-developer",
      coverImage: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=1200&q=80",
      content: `<h2>I Was Terrible at Focus</h2><p>Before my month at the ashram, I would estimate I did perhaps 90 minutes of truly focused work in an 8-hour workday. The rest was a blur of Slack notifications, context switching, half-read articles, and the low-grade anxiety that comes from never feeling done.</p><p>I had read every book on deep work. I had tried every system: Pomodoro, time-blocking, digital minimalism. Nothing stuck.</p><h2>Then I Met the Monks</h2><p>The ashram in Haridwar where I stayed had a group of elder monks, ranging from 65 to 84, who maintained a daily prayer and contemplation schedule that had not changed in decades. I watched them for the first week with the detached curiosity of an outsider.</p><p>By the second week, something began to shift in me.</p><h2>The Secret Was Not Discipline</h2><p>I expected the monks' ability to focus would come from rigid self-discipline — the kind that productivity books praise. Instead, what I noticed was something closer to <strong>indifference to urgency</strong>.</p><p>When I asked 82-year-old Swamiji how he maintained such stillness, he looked at me with gentle amusement and said: "I have been here before the notification. I will be here after it."</p><p>He was not dismissing technology. He was describing a relationship with time that renders false urgency powerless.</p><h2>What I Brought Back</h2><p>I restructured my workday around three principles I observed in the elder monks:<br/><strong>1. Anchor rituals instead of schedules.</strong> Not "9am standup" but a 20-minute tea ritual before any screen time.<br/><strong>2. End before empty.</strong> The monks stopped prayers while their attention was still sharp. I began ending deep work sessions while I still had energy, not when I was depleted.<br/><strong>3. Talk to someone without a stake.</strong> The monks had no career agenda, no social media presence, no competition. Conversations with them were purifyingly honest.</p><h2>The Unexpected Gift</h2><p>My sprints became 40% more productive (measurable in story points). But more than that, I stopped dreading Mondays. The work became meaningful again because it sat inside a life that felt meaningful.</p><p>None of that came from a framework. It came from an 82-year-old who saw urgency for what it was.</p>`,
      excerpt: "A software developer spends a month with elder monks and discovers the focus technique that no productivity book has ever described.",
      readTime: 8,
      views: 4260,
      status: "PUBLISHED" as const,
      authorId: author3.id,
      tagNames: ["Mindfulness", "Remote Work", "Ashram", "Purpose"],
    },
    {
      title: "BridgeCall: How We Built a Platform Pairing Remote Workers with Ashram Elders",
      slug: "bridgecall-platform-remote-workers-ashram-elders",
      coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
      content: `<h2>The Problem That Wouldn't Leave Me Alone</h2><p>After my first ashram experience, I was obsessed with one question: why had I never met an elder like Ramprasad-ji in seventeen years of professional life?</p><p>The answer is geography and incentive. Remote work had freed me from the office but not redistributed me into the fabric of society. I was floating — technically anywhere, practically nowhere.</p><h2>The Hypothesis</h2><p>What if weekly 45-minute video conversations between remote workers and ashram or elder-care residents could measurably reduce loneliness in both groups? Not therapy. Not volunteering. Just two people with radically different life contexts having a real conversation.</p><p>We called it BridgeCall.</p><h2>Building the MVP in 6 Weeks</h2><p>The technical stack was deliberately simple: Next.js frontend, a PostgreSQL database, and the Daily.co API for video. The harder problem was matching.</p><p>We built a compatibility questionnaire covering: professional background, language preference, conversational style, topics of interest, and availability windows. The algorithm was less about similarity and more about complementarity — a software engineer paired with a former farmer, a startup founder with a retired teacher.</p><h2>What the First 100 Pairs Taught Us</h2><p>Within week one, 94% of pairs reported their conversation was "more meaningful than expected." By week six, 71% had enrolled in ongoing weekly sessions voluntarily.</p><p>The qualitative data was even more striking. Remote workers described the calls as "the most human part of my week." Elders said they felt "seen" in a way family visits rarely achieved anymore.</p><p>One pair — a 28-year-old product manager in Bengaluru and an 81-year-old retired Sanskrit scholar in Vrindavan — began co-writing a blog together about modern work and ancient wisdom. They have now published eleven posts.</p><h2>What We Learned About Connection</h2><p>Loneliness is not about quantity of contact. Remote workers have hundreds of Slack messages a day. Elders often have family visits on weekends. Loneliness is about <em>depth of presence</em> — whether you feel truly encountered by another person.</p><p>BridgeCall works because it creates conditions for presence: low stakes, no agenda, radical difference, and a gentle structure that says: just show up and be curious.</p>`,
      excerpt: "How a personal experience at an ashram became a platform that has now facilitated over 10,000 conversations between remote workers and elderly residents.",
      readTime: 10,
      views: 2890,
      status: "PUBLISHED" as const,
      authorId: author3.id,
      tagNames: ["Human Connection", "Technology", "Community", "Elderly Care"],
    },
    {
      title: "Dear Elder Who Taught Me to Breathe: A Letter From a Remote Worker",
      slug: "letter-to-elder-ashram-remote-worker",
      coverImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&q=80",
      content: `<h2>Dear Yamunabai-ji,</h2><p>You probably don't remember me. I was the young woman from the city who sat across from you in the ashram common room every afternoon during that March three years ago. I was always typing on my laptop, always slightly stressed, always carrying a half-drunk cup of tea that had gone cold.</p><p>You were 76. You sat very still. And you watched me with an expression I couldn't quite read — not pity, not judgment. Something closer to patience.</p><h2>What You Said That Changed Me</h2><p>On my fifth day, you said something I have thought about every day since. I had told you I was "too busy to feel lonely." You listened fully, then said:</p><blockquote>"Beta, when you are too busy to feel, you are not living — you are only surviving."</blockquote><p>I argued with you, of course. I was proud of my busyness. It was armour. But armour is heavy, and you could see that I was tired.</p><h2>The Afternoon You Taught Me to Breathe</h2><p>You did not teach me meditation in any formal sense. You simply asked me to sit next to you for 20 minutes and do nothing. No phone. No laptop. Just the courtyard and the birds and the smell of jasmine.</p><p>I lasted four minutes the first day. Seven the next. By the end of the week, I could sit for the full 20 minutes and feel, underneath the noise, a kind of quiet I had forgotten existed.</p><h2>What I Wish I Had Asked You</h2><p>I left before I meant to — a product launch, a critical meeting, the usual reasons. I wish I had stayed another week. I wish I had asked about your daughter who visited on Sundays, about the partition stories you mentioned once and then pulled back from. I wish I had asked how you found peace not as a technique but as a way of being in the world.</p><p>I am writing this publicly because I know there are thousands of people like the March version of me — remote workers buzzing with productivity, quietly hollowed out, one meeting away from asking if any of this matters.</p><p>They need to meet someone like you. And you might need to meet more people like me — people who will sit down, eventually stop typing, and learn to breathe again.</p><h2>I'm Working on Making That Happen</h2><p>The project I'm now part of tries to do exactly that. Not as a substitute for the real thing — nothing replaces sitting with you in that courtyard. But as a bridge, for now, until more people can find their way to the real thing.</p><p>Thank you, Yamunabai-ji. I am still learning to breathe.</p>`,
      excerpt: "An open letter from a remote worker to the 76-year-old ashram elder who taught her that busyness is not a shield against loneliness.",
      readTime: 6,
      views: 7340,
      status: "PUBLISHED" as const,
      authorId: author1.id,
      tagNames: ["Human Connection", "Loneliness", "Ashram", "Mental Health"],
    },
    {
      title: "Intergenerational Exchange as Medicine: What the Research Shows",
      slug: "intergenerational-exchange-loneliness-research",
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
      content: `<h2>Setting the Stage</h2><p>For the past two years, our team at the Wellbeing Research Collaborative has been studying a question that sounds simple but proves surprisingly complex: what actually reduces pathological loneliness in both young remote workers and elderly residential community members?</p><p>The answer emerging from our data points to one consistent thread: <strong>intergenerational, reciprocal exchange</strong>.</p><h2>Study Design</h2><p>We recruited 280 participants across two groups: (1) fully remote knowledge workers aged 24–38 who self-reported significant loneliness, and (2) residents of ashrams and elder-care facilities aged 65–89 who scored above threshold on the UCLA Loneliness Scale.</p><p>Participants were randomly assigned to one of three conditions:<br/>— <strong>Control</strong>: No intervention.<br/>— <strong>Peer connection</strong>: Weekly calls with an age-matched peer.<br/>— <strong>Intergenerational exchange</strong>: Weekly 45-min video calls with a partner from the opposite group, using our structured but open-ended conversation framework.</p><h2>Results After 12 Weeks</h2><p>The findings were statistically significant and practically meaningful:</p><ul><li>Control group: Loneliness scores unchanged or slightly worsened.</li><li>Peer connection group: 18% average reduction in loneliness scores.</li><li>Intergenerational exchange group: <strong>41% average reduction in loneliness scores.</strong></li></ul><p>Both the remote workers and the elders in the intergenerational condition showed improvements. Neither group improved significantly more than the other — the benefit was genuinely mutual.</p><h2>Why It Works: The Mechanisms</h2><p>Qualitative interviews revealed three mechanisms driving the effect:</p><p><strong>1. Perspective shock.</strong> Conversations with someone from a radically different life stage disrupt the self-referential thought loops that sustain loneliness.</p><p><strong>2. Generativity.</strong> Elders experienced a renewed sense of purpose in passing on wisdom. Remote workers experienced meaning in being genuinely curious about a life well-lived.</p><p><strong>3. Unconditional presence.</strong> Unlike calls with colleagues or family, intergenerational exchanges carry no performance pressure. You can simply be.</p><h2>Implications for Policy and Product Design</h2><p>These results suggest that programs pairing remote workers with ashram and elder-care residents deserve serious institutional investment. We estimate a cost per meaningful-connection-hour of approximately Rs 180 using video infrastructure — significantly lower than most mental health interventions at comparable effect sizes.</p><p>The technology is trivial. The will is what's needed.</p>`,
      excerpt: "A 12-week randomised study finds that intergenerational video calls between remote workers and ashram elders reduce loneliness by 41% in both groups.",
      readTime: 8,
      views: 3150,
      status: "PUBLISHED" as const,
      authorId: author2.id,
      tagNames: ["Intergenerational", "Elderly Care", "Wellness", "Human Connection"],
    },
  ];

  for (const postData of postsData) {
    const { tagNames, ...data } = postData;
    await prisma.post.create({
      data: {
        ...data,
        tags: {
          create: tagNames.map((name) => ({
            tag: { connect: { name } },
          })),
        },
      },
    });
  }

  console.log(`✅ Created ${postsData.length} posts`);

  // ─── Create some interactions ───────────────────────────
  const allPosts = await prisma.post.findMany();

  // Likes
  for (const post of allPosts.slice(0, 4)) {
    await prisma.like.create({ data: { userId: author1.id, postId: post.id } });
    await prisma.like.create({ data: { userId: author2.id, postId: post.id } });
    await prisma.like.create({ data: { userId: author3.id, postId: post.id } });
  }

  // Bookmarks
  for (const post of allPosts.slice(0, 3)) {
    await prisma.bookmark.create({ data: { userId: author1.id, postId: post.id } });
    await prisma.bookmark.create({ data: { userId: author4.id, postId: post.id } });
  }

  // Comments
  await prisma.comment.create({
    data: { content: "This hit me hard. I haven't had a real conversation in weeks and I work from home 5 days a week. Going to look into ashram stays.", authorId: author2.id, postId: allPosts[0].id },
  });
  await prisma.comment.create({
    data: { content: "Ramprasad-ji sounds like the kind of person we all need in our lives. The irony of freedom and isolation in remote work is real.", authorId: author3.id, postId: allPosts[0].id },
  });
  await prisma.comment.create({
    data: { content: "That 41% reduction in loneliness scores is extraordinary. Are you planning to expand the study to a larger cohort?", authorId: author1.id, postId: allPosts[5].id },
  });
  await prisma.comment.create({
    data: { content: "The letter format is deeply moving. I'd love to connect elders from the Vrindavan ashram I volunteer with to this initiative.", authorId: author4.id, postId: allPosts[4].id },
  });

  // Follows
  await prisma.follow.create({ data: { followerId: author2.id, followingId: author1.id } });
  await prisma.follow.create({ data: { followerId: author3.id, followingId: author1.id } });
  await prisma.follow.create({ data: { followerId: author4.id, followingId: author1.id } });
  await prisma.follow.create({ data: { followerId: author1.id, followingId: author2.id } });
  await prisma.follow.create({ data: { followerId: author1.id, followingId: author3.id } });

  console.log("✅ Created likes, bookmarks, comments & follows");
  console.log("\n🎉 Seed complete!\n");
  console.log("─── Login Credentials ───────────────────");
  console.log("Admin:  admin@inkflow.com / password123");
  console.log("User:   sarah@inkflow.com / password123");
  console.log("User:   anita@inkflow.com / password123");
  console.log("User:   james@inkflow.com / password123");
  console.log("User:   emily@inkflow.com / password123");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
