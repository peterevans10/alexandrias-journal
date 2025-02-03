"""create_questions_table

Revision ID: 3e5a9c8d1234
Revises: 7b377a24de85
Create Date: 2025-02-02 19:48:16.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3e5a9c8d1234'
down_revision = '7b377a24de85'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('recipient_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('text', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(op.f('ix_questions_user_id'), 'questions', ['user_id'], unique=False)
    op.create_index(op.f('ix_questions_recipient_id'), 'questions', ['recipient_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_questions_recipient_id'), table_name='questions')
    op.drop_index(op.f('ix_questions_user_id'), table_name='questions')
    op.drop_table('questions')
