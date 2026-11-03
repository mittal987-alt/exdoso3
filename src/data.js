const demoProfiles = [
  {
    id: "ashish-dhawan", name: "Ashish Dhawan", role: "Founder-Chairperson, The Convergence Foundation",
    organization: "Education philanthropy & systems change", location: "New Delhi, India",
    experience: "Education philanthropist; founding chairperson of Ashoka University; supports education and social-sector organizations.",
    signals: ["education philanthropy", "systems change", "school ecosystem", "education leadership", "network building"],
    sourceUrl: "https://centralsquarefoundation.org/", sourceLabel: "Central Square Foundation"
  },
  {
    id: "anurag-behar", name: "Anurag Behar", role: "CEO, Azim Premji Foundation",
    organization: "School education & philanthropy", location: "Bengaluru, India",
    experience: "Leads a large education foundation; works on public education, teacher development, and system-level improvement.",
    signals: ["school education", "teacher development", "systems change", "education philanthropy", "school networks"],
    sourceUrl: "https://azimpremjifoundation.org/", sourceLabel: "Azim Premji Foundation"
  },
  {
    id: "rukmini-banerji", name: "Rukmini Banerji", role: "Senior Advisor; former CEO, Pratham Education Foundation",
    organization: "Learning outcomes & education systems", location: "New Delhi, India",
    experience: "Leads a major education nonprofit focused on foundational learning, assessment, and partnerships with education systems.",
    signals: ["school education", "learning outcomes", "assessment", "education leadership", "school networks"],
    sourceUrl: "https://pratham.org.uk/team/rukmini-banerji/", sourceLabel: "Pratham UK biography",
    sourceType: "individual"
  },
  {
    id: "madhav-chavan", name: "Madhav Chavan", role: "Co-founder, Pratham Education Foundation",
    organization: "Foundational learning & community education", location: "Mumbai, India",
    experience: "Co-founded an education organization focused on foundational learning and community-based education programs.",
    signals: ["school education", "learning outcomes", "education entrepreneurship", "community impact", "school networks"],
    sourceUrl: "https://www.pratham.org/", sourceLabel: "Pratham"
  },
  {
    id: "shaheen-mistri", name: "Shaheen Mistri", role: "Founder & CEO, Teach For India",
    organization: "Teacher network & school partnerships", location: "Mumbai, India",
    experience: "Founded and leads a national teacher fellowship and alumni network working with schools and underserved communities.",
    signals: ["teacher development", "school partnerships", "school networks", "education leadership", "community impact"],
    sourceUrl: "https://www.teachforindia.org/", sourceLabel: "Teach For India"
  },
  {
    id: "kiran-bir-sethi", name: "Kiran Bir Sethi", role: "Founder, Riverside School & Design for Change",
    organization: "School leadership & learning design", location: "Ahmedabad, India",
    experience: "Founded a school and an international student-led change movement; promotes design-led learning and student agency.",
    signals: ["school founder", "school leadership", "learning design", "school networks", "education innovation"],
    sourceUrl: "https://www.dfcworld.org/", sourceLabel: "Design for Change"
  },
  {
    id: "lina-ashar", name: "Lina Ashar", role: "Founder, Kangaroo Kids Education",
    organization: "Early learning & school entrepreneurship", location: "Mumbai, India",
    experience: "Education entrepreneur associated with the development of early-learning and K-12 school brands.",
    signals: ["school founder", "school networks", "education entrepreneurship", "early learning", "school leadership"],
    sourceUrl: "https://kangarookids.in/", sourceLabel: "Kangaroo Kids"
  },
  {
    id: "atul-temurnikar", name: "Atul Temurnikar", role: "Chairman, Global Schools Foundation",
    organization: "International school network", location: "Singapore",
    experience: "Built and leads an international network of schools serving students across multiple countries.",
    signals: ["school network", "multi-school operations", "school founder", "education entrepreneurship", "school leadership"],
    sourceUrl: "https://www.globalschoolsfoundation.org/", sourceLabel: "Global Schools Foundation"
  },
  {
    id: "sunita-gandhi", name: "Sunita Gandhi", role: "Founder, DEVI Sansthan",
    organization: "Education innovation & school improvement", location: "Lucknow, India",
    experience: "Educationist and school-improvement advocate working on learning outcomes, literacy, and education innovation.",
    signals: ["school improvement", "education innovation", "learning outcomes", "school ecosystem", "education leadership"],
    sourceUrl: "https://www.devi.in/", sourceLabel: "DEVI Sansthan"
  },
  {
    id: "sumeet-mehta", name: "Sumeet Mehta", role: "Co-founder & CEO, LEAD Group",
    organization: "School education technology", location: "Mumbai, India",
    experience: "Co-founded an education company that works with schools on integrated curriculum, teaching, and school operations.",
    signals: ["school partnerships", "school technology", "school networks", "education entrepreneurship", "school improvement"],
    sourceUrl: "https://leadschool.in/", sourceLabel: "LEAD Group"
  },
  {
    id: "sridhar-rajagopalan", name: "Sridhar Rajagopalan", role: "Co-founder, Educational Initiatives",
    organization: "Assessment & learning improvement", location: "Ahmedabad, India",
    experience: "Works with schools and education systems on assessments, learning outcomes, and evidence-led improvement.",
    signals: ["school improvement", "assessment", "learning outcomes", "school partnerships", "education entrepreneurship"],
    sourceUrl: "https://www.ei-india.com/", sourceLabel: "Educational Initiatives"
  },
  {
    id: "pramath-raj-sinha", name: "Pramath Raj Sinha", role: "Founder, Harappa Education; founding dean, ISB",
    organization: "Education institution building", location: "New Delhi, India",
    experience: "Education entrepreneur and institution builder with experience founding and leading education organizations.",
    signals: ["education entrepreneurship", "education leadership", "institution building", "school ecosystem", "network building"],
    sourceUrl: "https://harappa.education/", sourceLabel: "Harappa Education"
  },
  {
    id: "parth-j-shah", name: "Parth J. Shah", role: "Founder, Centre for Civil Society",
    organization: "Education policy & school choice", location: "New Delhi, India",
    experience: "Education policy advocate whose work includes school choice, education access, and engagement with school systems.",
    signals: ["education policy", "school ecosystem", "school choice", "systems change", "education leadership"],
    sourceUrl: "https://ccs.in/", sourceLabel: "Centre for Civil Society"
  },
  {
    id: "aditi-avasthi", name: "Aditi Avasthi", role: "Founder & CEO, Embibe",
    organization: "Education technology & learning", location: "Bengaluru, India",
    experience: "Education entrepreneur building learning technology and assessment products used by students and education partners.",
    signals: ["education entrepreneurship", "learning technology", "assessment", "education innovation", "school ecosystem"],
    sourceUrl: "https://www.embibe.com/", sourceLabel: "Embibe"
  },
  {
    id: "nita-ambani", name: "Nita Ambani", role: "Founder-Chairperson, Dhirubhai Ambani International School",
    organization: "School leadership & education philanthropy", location: "Mumbai, India",
    experience: "Founded a school and leads a philanthropic organization with programs spanning education and community development.",
    signals: ["school founder", "school leadership", "education philanthropy", "school ecosystem", "community impact"],
    sourceUrl: "https://www.dais.edu.in/", sourceLabel: "Dhirubhai Ambani International School"
  },
  {
    id: "sushma-berlia", name: "Sushma Berlia", role: "President, Apeejay Education Society",
    organization: "Education group & school network", location: "New Delhi, India",
    experience: "Leads an education society with schools and higher-education institutions; experienced in education governance.",
    signals: ["school network", "school leadership", "education governance", "education entrepreneurship", "multi-school operations"],
    sourceUrl: "https://apeejay.edu/", sourceLabel: "Apeejay Education"
  },
  {
    id: "kp-gopalkrishna", name: "K. P. Gopalkrishna", role: "Founder, National Public School Group",
    organization: "School group & K-12 education", location: "Bengaluru, India",
    experience: "Founded and led a group of schools, with decades of experience in K-12 school management and education.",
    signals: ["school founder", "school network", "multi-school operations", "school leadership", "K-12 education"],
    sourceUrl: "https://npsinternational.org/", sourceLabel: "National Public School"
  },
  {
    id: "amol-arora", name: "Amol Arora", role: "Managing Director, SHEMROCK & SHEMFORD Group of Schools",
    organization: "Preschool & K-12 school network", location: "New Delhi, India",
    experience: "Leads a multi-school education group spanning preschool and K-12 schools, with franchise and network experience.",
    signals: ["school network", "multi-school operations", "school entrepreneurship", "school leadership", "early learning"],
    sourceUrl: "https://shemrock.com/", sourceLabel: "SHEMROCK"
  },
  {
    id: "dina-nath-batra", name: "Dina Nath Batra", role: "Educationist; former general secretary, Vidya Bharati",
    organization: "School network & education advocacy", location: "New Delhi, India",
    experience: "Long-time educationist associated with a large school network and curriculum and education advocacy.",
    signals: ["school network", "education advocacy", "school leadership", "school ecosystem", "education governance"],
    sourceUrl: "https://vidyabharti.net/", sourceLabel: "Vidya Bharati"
  },
  {
    id: "sonam-wangchuk", name: "Sonam Wangchuk", role: "Founder, SECMOL",
    organization: "Education innovation & school reform", location: "Ladakh, India",
    experience: "Education reformer and founder of a learning campus focused on locally relevant, student-centered education.",
    signals: ["school founder", "education innovation", "learning design", "school improvement", "community impact"],
    sourceUrl: "https://secmol.org/", sourceLabel: "SECMOL"
  },
  {
    id: "vineet-joshi", name: "Vineet Joshi", role: "Education administrator; former CBSE chairperson",
    organization: "School education policy & administration", location: "New Delhi, India",
    experience: "Education administrator with experience in school-board leadership and education-system governance.",
    signals: ["education governance", "school ecosystem", "school leadership", "education policy", "systems change"],
    sourceUrl: "https://www.cbse.gov.in/", sourceLabel: "Central Board of Secondary Education"
  }
];

export const demoCandidates = demoProfiles.map((profile) => ({
  ...profile,
  sourceType: profile.sourceType || "organization"
}));

export const referenceProfiles = {
  kiran: {
    name: "Kiran Bir Sethi",
    role: "Founder, Riverside School & Design for Change",
    organization: "School leadership & learning design",
    location: "Ahmedabad, India",
    experience: "School founder and education innovator focused on design-led learning, student agency, and school networks.",
    text: "Founder of Riverside School and Design for Change. School founder, school leader, design-led learning, student agency, education innovation, and school networks. Ahmedabad, India.",
    source: "Design for Change",
    sourceUrl: "https://www.dfcworld.org/"
  },
  ashish: {
    name: "Ashish Dhawan",
    role: "Education philanthropy & systems change",
    organization: "The Convergence Foundation",
    location: "New Delhi, India",
    experience: "Education philanthropist supporting education and social-sector organizations and system-level change.",
    text: "Education philanthropist and founder-chairperson. Supports education and social-sector organizations, school ecosystem, systems change, education leadership, network building. New Delhi, India.",
    source: "Central Square Foundation",
    sourceUrl: "https://centralsquarefoundation.org/"
  },
  shaheen: {
    name: "Shaheen Mistri",
    role: "School and teacher network builder",
    organization: "Teach For India",
    location: "Mumbai, India",
    experience: "Founder and CEO building a teacher fellowship and alumni network working with schools.",
    text: "Founder and CEO of Teach For India. Builds a national teacher fellowship and alumni network working with schools. Teacher development, school partnerships, education leadership, community impact. Mumbai, India.",
    source: "Teach For India",
    sourceUrl: "https://www.teachforindia.org/"
  }
};

export const ecosystemConcepts = {
  school_leadership: ["school leader", "school leadership", "principal", "head of school", "school director", "school founder", "school owner", "trustee", "school management", "school governance", "school operations"],
  school_network: ["school network", "school networks", "multi-school", "multi campus", "school group", "school groups", "school partnerships", "school partnership", "school ecosystem", "school ecosystem professionals", "franchise", "education group"],
  teaching_learning: ["teacher development", "teacher training", "learning design", "student agency", "learning outcomes", "assessment", "curriculum", "early learning", "k-12", "school improvement"],
  education_systems: ["systems change", "education policy", "education governance", "education administration", "school board", "public education", "education philanthropy", "education advocacy"],
  innovation: ["education innovation", "school technology", "learning technology", "education technology", "education entrepreneurship", "institution building", "community impact", "network building"]
};
