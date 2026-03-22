export type NavKey = 'home' | 'about' | 'work';

export type CaseStudyCard = {
  slug: 'stage-ten' | 'sfu' | 'freelance';
  title: string;
  href: string;
  summary: string;
  imageAlt: string;
  sources: Array<{ srcset: string; media?: string }>;
  imgSrcset: string;
};

export const defaultTitle = 'Josh Laidlaw | Designer and Front-end Developer';
export const defaultDescription =
  'Portfolio of Josh Laidlaw - Designer and Front-end Developer';

export const caseStudies: CaseStudyCard[] = [
  {
    slug: 'stage-ten',
    title: 'Stage TEN',
    href: '/stage-ten',
    summary: 'Mix and combine live video in the cloud.',
    imageAlt: "Stage TEN's cloud-based control room",
    sources: [
      {
        srcset: '/img/TJ_framed_large_@1x.png, /img/TJ_framed_@2x.png 2x',
        media: '(min-width: 800px)',
      },
      {
        srcset: '/img/TJ_framed_@1x.png, /img/TJ_framed_@2x.png 2x',
      },
    ],
    imgSrcset: '/img/TJ_framed_@1x.png, /img/TJ_framed_@2x.png 2x',
  },
  {
    slug: 'sfu',
    title: 'SFU',
    href: '/sfu',
    summary: "Canada's top comprehensive university.",
    imageAlt: "SFU's homepage cica 2012",
    sources: [
      {
        srcset: '/img/sfu_large_@1x.png, /img/sfu_framed_large_@2x.png 2x',
        media: '(min-width: 800px)',
      },
      {
        srcset: '/img/sfu_large_@1x.png, /img/sfu_framed_large_@2x.png 2x',
      },
    ],
    imgSrcset: '/img/sfu_large_@1x.png, /img/sfu_large_@2x.png 2x',
  },
  {
    slug: 'freelance',
    title: 'Freelance',
    href: '/freelance',
    summary:
      'Helping to promote a sport in Canada, building leaders for the future and find the next big idea.',
    imageAlt: "Some examples of work I've done for clients",
    sources: [
      {
        srcset: '/img/freelance/freelance.png, /img/freelance/freelance@2x.png 2x',
        media: '(min-width: 800px)',
      },
      {
        srcset: '/img/freelance/freelance.png, /img/freelance/freelance@2x.png 2x',
      },
    ],
    imgSrcset: '/img/freelance/freelance.png, /img/freelance/freelance@2x.png 2x',
  },
];
