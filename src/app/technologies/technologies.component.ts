import { Component } from '@angular/core'
import { Technologies, Technology } from '../../types/Technology'
import { TechnologyComponent } from '../technology/technology.component'
import { CapitalizeFirstLetterPipe } from '../pipes/capitalize-first-letter.pipe'
import { CommonModule } from '@angular/common'

type groupedTechnologies = Technology[][]

@Component({
  selector: 'app-technologies',
  standalone: true,
  imports: [TechnologyComponent, CapitalizeFirstLetterPipe, CommonModule],
  templateUrl: './technologies.component.html',
  styleUrl: './technologies.component.scss',
})
export class TechnologiesComponent {
  technologiesList: Technologies = {}
  showRelevantOnly: boolean = true
  technologiesListByCategory: groupedTechnologies = []
  filteredListByCategory: groupedTechnologies = []

  constructor() {
    this.technologiesList = {
      HTML: {
        name: 'HTML',
        category: 'frontend',
        image: './assets/techs/html.svg',
        link: 'https://www.w3.org/html/',
        isRelevant: false,
      },
      CSS: {
        name: 'CSS',
        category: 'frontend',
        image: './assets/techs/css.svg',
        link: 'https://www.w3.org/Style/CSS/',
        isRelevant: false,
      },
      JavaScript: {
        name: 'JavaScript',
        category: 'frontend',
        image: './assets/techs/javascript.svg',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        isRelevant: false,
      },
      HTML2: {
        name: 'HTML',
        category: 'frontend',
        image: './assets/techs/html.svg',
        link: 'https://www.w3.org/html/',
        isRelevant: true,
      },
      CSS2: {
        name: 'CSS',
        category: 'frontend',
        image: './assets/techs/css.svg',
        link: 'https://www.w3.org/Style/CSS/',
        isRelevant: true,
      },
      JavaScript2: {
        name: 'JavaScript',
        category: 'frontend',
        image: './assets/techs/javascript.svg',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        isRelevant: true,
      },
      Nodejs: {
        name: 'Nodejs',
        category: 'backend',
        image: 'path/to/image/nodejs.png',
        link: 'https://nodejs.org/',
        isRelevant: true,
      },
      Python: {
        name: 'Python',
        category: 'backend',
        image: 'path/to/image/python.png',
        link: 'https://www.python.org/',
        isRelevant: true,
      },
      RubyOnRails: {
        name: 'Ruby on Rails',
        category: 'backend',
        image: 'path/to/image/rubyonrails.png',
        link: 'https://rubyonrails.org/',
        isRelevant: true,
      },
      Jest: {
        name: 'Jest',
        category: 'test',
        image: 'path/to/image/jest.png',
        link: 'https://jestjs.io/',
        isRelevant: false,
      },
      Mocha: {
        name: 'Mocha',
        category: 'test',
        image: 'path/to/image/mocha.png',
        link: 'https://mochajs.org/',
        isRelevant: false,
      },
      Selenium: {
        name: 'Selenium',
        category: 'test',
        image: 'path/to/image/selenium.png',
        link: 'https://www.selenium.dev/',
        isRelevant: false,
      },
    }

    this.technologiesListByCategory = this.groupByCategory(
      Object.values(this.technologiesList),
    )

    this.filterByRelevance()

    console.log(this.filteredListByCategory)
  }

  groupByCategory(technologies: Technology[]) {
    let groupedTechnologies: groupedTechnologies = []
    const key = 'category'

    let currentTechCategory: string = ''

    for (const tech of technologies) {
      const techCategory = tech[key]

      if (techCategory !== currentTechCategory) {
        groupedTechnologies.push([])
        currentTechCategory = techCategory
      }

      groupedTechnologies[groupedTechnologies.length - 1].push(tech)
    }

    return groupedTechnologies
  }

  toggleRelevanceFilter() {
    this.showRelevantOnly = !this.showRelevantOnly
    this.filterByRelevance()
  }

  filterByRelevance() {
    this.filteredListByCategory = this.technologiesListByCategory
      .map((categoryList) =>
        this.showRelevantOnly
          ? categoryList.filter((tech) => tech.isRelevant)
          : categoryList,
      )
      .filter((categoryList) => categoryList.length > 0)
  }
}
