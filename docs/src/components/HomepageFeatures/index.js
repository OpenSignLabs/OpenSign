import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';



const FeatureList = [
  {
    title: 'What is OpenSign™?',
    PNGUrl: '/img/logo.svg',
    description: (
      <>
        <div style={{ textAlign: 'justify' }}>At OpenSign Labs, we're redefining the landscape of digital signatures. Our mission is to make digital document signing not just a formality, but an integral part of your organization's digital transformation journey. OpenSign™ Docs is your gateway to a world where efficiency, security and simplicity reign supreme.</div>
      </>
    ),
  },
  {
    title: 'Why Choose OpenSign™?',
    PNGUrl: '/img/whychooseus.svg',
    description: (
      <>
      <div style={{ textAlign: 'justify' }}>
    <ul>
        <li>
            <strong>Innovative Technology</strong>: Harness the latest advancements in e-signature technology.
        </li>
        <li>
            <strong>Data-Driven Security</strong>: With encryption and compliance at the forefront, your documents are in safe hands. We also provide self host option for those who want full control of their data.
        </li>
        <li>
            <strong>User-Centric Design</strong>: Experience unparalleled ease of use, designed for individuals and businesses alike. OpenSign™ user experience is designed while keeping the most novice user in mind. Finally, a tool that does not need numerous hours of training to get started.
        </li>
        <li>
            <strong>Scalable Solutions</strong>: From small startups to large corporations, our platform grows with your needs. From free for life plan for individuals to branding and single-sign-on support for enterprises, our platform supports everything.
        </li>
    </ul>
</div>
      </>
    ),
  },
  {
    title: 'Getting Started',
    PNGUrl: '/img/getstarted.svg',
    description: (
      <>
        <div style={{ textAlign: 'justify' }}>
    <p>
        Dive into our comprehensive guides and tutorials. Whether you're a new user or looking to integrate OpenSign™ into your existing workflow, we have everything you need to get started.
    </p>
    <ul>
        <li>
            <strong>[Tutorial](https://docs.opensignlabs.com/docs/help/intro)</strong>: Get up and running in no time. Get all the help you need to navigate you through the already seamless UX of OpenSign.
        </li>
        <li>
            <strong>[Github Discussions](https://github.com/OpenSignLabs/OpenSign/discussions)</strong>: Discuss your ideas & issues with the community.
        </li>
        <li>
            <strong>Social media</strong>: Join us on [Discord](https://discord.com/invite/xe9TDuyAyj), [Twitter](https://www.twitter.com/opensignhq), [LinkedIn](https://www.linkedin.com/company/opensign%E2%84%A2/) & [Facebook](https://www.facebook.com/profile.php?id=61551030403669).
        </li>
    </ul>
</div>

      </>
    ),
  },
];

function Feature({PNGUrl, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
      <img src={PNGUrl} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}


/*
 {
    title: 'Smart Attrition Control',
    PNGUrl: '/static/img/interview.png',
    description: (
      <>
        ProZone is a first-of-its-kind web 3.0 powered professional network that not only enables employees to find the right jobs & employers to find the right talent but also streamline the end-to-end recruitment process right from identification to retention. All this is achieved with the help of  the next genration DeFi powered platform.
      </>
    ),
  },
  {
    title: 'Our own POA Blockchain',
    PNGUrl: '/static/img/interview.png',
    description: (
      <>
        ProZone is a first-of-its-kind web 3.0 powered professional network that not only enables employees to find the right jobs & employers to find the right talent but also streamline the end-to-end recruitment process right from identification to retention. All this is achieved with the help of  the next genration DeFi powered platform.
      </>
    ),
  },
  {
    title: 'Recruitment Solution',
    PNGUrl: '/static/img/interview.png',
    description: (
      <>
        ProZone is a first-of-its-kind web 3.0 powered professional network that not only enables employees to find the right jobs & employers to find the right talent but also streamline the end-to-end recruitment process right from identification to retention. All this is achieved with the help of  the next genration DeFi powered platform.
      </>
    ),
  },
  */
