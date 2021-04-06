<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="explorer-gui/explorer-gui/src/assets/logo.png" alt="Logo" width="400" height="80">
  </a>

  <h3 align="center">AcriaScan Explorer</h3>

  <p align="center">
    Real-time multi-chain Explorer for Polkadot, Kusama, Rococo networks.
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

There are many blockchain explorers on GitHub, however, acriascan explorer is the first one which supports polkadot networks. 

Here's why:
* Acriascan uses it's python backend for it's real time blockchain data.
* It gets all real time data from several networks.
* The best explorer which is built on Angular Framework.


### Built With

* [Python](https://python.org)
* [AngularJS](https://angular.io)
* [Docker](https://docker.com)



<!-- GETTING STARTED -->
## Getting Started

This is the guide of how you may give instructions on setting up your project on server.
To get a copy up and running follow these simple example steps.

### Prerequisites

This is the packages you have to install on the server before deploy the AcriaScan explorer.
* docker
  ```sh
  sudo apt-get install docker.io
  ```
* nodejs
  ```sh
  sudo apt-get install nodejs
  ```
* angular
  
  ```sh
  sudo npm install -g @angular/cli
  ```
### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Acria-Network/xplorerdot.git
   ```
2. Run Harvester
   ```sh
   cd harvester
   docker-compose up –build
   ```
3. Run Explorer API
   ```JS
   cd explorer-api
   docker-compose up –build
   ```
4. Run Explorer gui
   ```sh
   cd explorer-gui
   npm install
   npm start
   docker build -t appui .
   docker run -d --name appui -p 80:80 appui

   ```


<!-- USAGE EXAMPLES -->
## Usage

This project can be used for searching blocks and transactions of polkadot, kusama, rococo networks.
It also provides many things for getting information for polka networks.


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/Acria-Network/xplorerdot/issues) for a list of proposed features (and known issues).


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Project Link: [https://github.com/Acria-Network/xplorerdot](https://github.com/Acria-Network/xplorerdot)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Python](https://python.org)
* [AngularJS](https://angular.io)
* [NodeJS](https://nodejs.org)
* [Docker](https://docker.com)
* [MySQL](https://mysql.com)





<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png
