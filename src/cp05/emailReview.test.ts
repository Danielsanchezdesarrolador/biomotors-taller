import { describe, expect, it } from 'vitest'
import { matchesQuoteEmailReview } from './emailReview'
import type { Revision } from './contracts'
const rev = {
  id:'00000000-0000-4000-8000-000000000004',
  payload:{customer:{email:'qa@invalid.test'}}
} as unknown as Revision
const valid = {
  reviewedRevisionId:rev.id,confirmedRecipient:'qa@invalid.test',
  recipientChecked:true,documentChecked:true,contactAuthorized:true
} as const
describe('CP05 operator email review',()=>{
  it('requires exact revision, contact and three declarations',()=>{
    expect(matchesQuoteEmailReview(rev,valid)).toBe(true)
    for(const bad of [
      {reviewedRevisionId:'00000000-0000-4000-8000-000000000005'},
      {confirmedRecipient:'wrong@invalid.test'},
      {confirmedRecipient:' qa@invalid.test'},
      {recipientChecked:false},{documentChecked:false},{contactAuthorized:false}
    ])expect(matchesQuoteEmailReview(rev,{...valid,...bad})).toBe(false)
  })
  it('rejects missing or malformed data',()=>{
    expect(matchesQuoteEmailReview(rev,null)).toBe(false)
    expect(matchesQuoteEmailReview(rev,[])).toBe(false)
    expect(matchesQuoteEmailReview({...rev,payload:{customer:{email:''}}} as unknown as Revision,valid)).toBe(false)
  })
})
