import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { TechService } from './tech.service'

describe('TechService', () => {
  let service: TechService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(TechService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
