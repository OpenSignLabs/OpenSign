import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';



const FeatureList = [
  {
    title: 'What is OpenSign™?',
    PNGUrl: '/img/logo.svg',
    description: (
      <>
        <div style={{ textAlign: 'justify' }}>At OpenSign Labs, we're redefining the landscape of electronic signatures. Our mission is to make document signing not just a formality, but an integral part of your digital transformation journey. OpenSign Docs is your gateway to a world where efficiency, security, and simplicity reign supreme.</div>
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
            <strong>Data-Driven Security</strong>: With encryption and compliance at the forefront, your documents are in safe hands.
        </li>
        <li>
            <strong>User-Centric Design</strong>: Experience unparalleled ease of use, designed for individuals and businesses alike.
        </li>
        <li>
            <strong>Scalable Solutions</strong>: From small startups to large corporations, our platform grows with your needs.
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
        Dive into our comprehensive guides and tutorials. Whether you're a new user or looking to integrate OpenSign into your existing workflow, we have everything you need to get started.
    </p>
    <ul>
        <li>
            <strong>Tutorial</strong>: Get up and running in no time. Get all the help you need to navigate you through the already seamless UX of OpenSign.
        </li>
        <li>
            <strong>Github Discussions</strong>: Discuss your ideas & issues with the community.
        </li>
        <li>
            <strong>Social media</strong>: Join us on Discord, Twitter, LinkedIn & Facebook.
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