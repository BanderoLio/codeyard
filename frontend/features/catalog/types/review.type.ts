export type EReviewType = 0 | 1;

export type TReview = {
  id: number;
  solution: number;
  review_type: EReviewType;
  added_by: string;
  created_at: string;
  updated_at: string;
};

export type TCreateReview = {
  solution: number;
  review_type: EReviewType;
};
